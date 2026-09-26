"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
exports.startServer = startServer;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const db_1 = require("./models/db");
const api_1 = require("./routes/api");
const app = (0, express_1.default)();
exports.app = app;
// Security Middlewares
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Allow client scripts & inline SVG/maps during development
    crossOriginEmbedderPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: true, // Allow frontend dev server
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Body Parsers
app.use(express_1.default.json({ limit: '25mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '25mb' }));
// Health Check
app.get('/health', (_req, res) => {
    res.json({
        status: 'ONLINE',
        service: 'MailTrace AI Server',
        timestamp: new Date().toISOString(),
    });
});
// API Routes
app.use('/api', api_1.apiRouter);
// Global Error Handler
app.use((err, _req, res, _next) => {
    console.error('[Server Error]:', err);
    res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_SERVER_ERROR',
            message: err.message || 'An unexpected error occurred.',
        },
    });
});
// Start Server
async function startServer() {
    try {
        await (0, db_1.initDatabase)();
        const server = app.listen(env_1.config.port, '0.0.0.0', () => {
            console.log(`====================================================`);
            console.log(`  🛡️  MAILTRACE AI FORENSIC PLATFORM BACKEND ONLINE`);
            console.log(`  🚀  Port: ${env_1.config.port}`);
            console.log(`  📊  Environment: ${env_1.config.nodeEnv}`);
            console.log(`  🌐  Health Check: http://localhost:${env_1.config.port}/health`);
            console.log(`====================================================`);
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`\n❌ [PORT CONFLICT] Port ${env_1.config.port} is already in use by another process.`);
                console.error(`👉 Close the old process or launch using start.bat which auto-clears ports.\n`);
            }
            else {
                console.error('[Server Error]:', err);
            }
            process.exit(1);
        });
    }
    catch (err) {
        console.error('[Startup Error] Failed to initialize backend server:', err);
        process.exit(1);
    }
}
if (require.main === module) {
    startServer();
}

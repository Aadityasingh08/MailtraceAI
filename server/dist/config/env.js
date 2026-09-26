"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
exports.config = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'mailtrace-ai-jwt-secret-secure-key-2025',
    databaseUrl: process.env.DATABASE_URL || '',
    aiApiKey: process.env.AI_API_KEY || '',
    virustotalApiKey: process.env.VIRUSTOTAL_API_KEY || '',
    abuseipdbApiKey: process.env.ABUSEIPDB_API_KEY || '',
    geolocationApiKey: process.env.GEOLOCATION_API_KEY || '',
};

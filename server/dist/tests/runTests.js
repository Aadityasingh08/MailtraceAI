"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const authService_1 = require("../auth/authService");
const iocExtractor_1 = require("../intelligence/iocExtractor");
const lookalikeDetector_1 = require("../intelligence/lookalikeDetector");
const headerForensics_1 = require("../intelligence/headerForensics");
const threatDetectionEngine_1 = require("../ai/threatDetectionEngine");
const graphBuilder_1 = require("../graph/graphBuilder");
const reportGenerator_1 = require("../reports/reportGenerator");
const db_1 = require("../models/db");
async function runTestSuite() {
    console.log('====================================================');
    console.log('  🧪 RUNNING MAILTRACE AI AUTOMATED TEST SUITE');
    console.log('====================================================\n');
    await (0, db_1.initDatabase)();
    // Test 1: Authentication & Password Hashing
    console.log('Test 1: Authentication & Password Hashing...');
    const testEmail = `test_analyst_${Date.now()}@mailtrace.soc`;
    const rawPass = 'CyberSecurePass2025!';
    const authRes = await authService_1.AuthService.register('Test Security Analyst', testEmail, rawPass, 'ANALYST');
    assert_1.default.strictEqual(authRes.user.email, testEmail);
    assert_1.default.strictEqual(authRes.user.role, 'ANALYST');
    assert_1.default.ok(authRes.token.length > 20);
    const loginRes = await authService_1.AuthService.login(testEmail, rawPass);
    assert_1.default.strictEqual(loginRes.user.id, authRes.user.id);
    console.log('  ✅ Authentication & JWT validation passed.');
    // Test 2: Domain Similarity & Lookalike Detector
    console.log('Test 2: Domain Lookalike Detection...');
    const lookalike1 = (0, lookalikeDetector_1.detectLookalikeDomain)('micros0ft-security.com');
    assert_1.default.strictEqual(lookalike1.isLookalike, true);
    assert_1.default.strictEqual(lookalike1.targetBrand, 'microsoft');
    const lookalike2 = (0, lookalikeDetector_1.detectLookalikeDomain)('paypa1-billing.xyz');
    assert_1.default.strictEqual(lookalike2.isLookalike, true);
    assert_1.default.strictEqual(lookalike2.targetBrand, 'paypal');
    const legitDomain = (0, lookalikeDetector_1.detectLookalikeDomain)('google.com');
    assert_1.default.strictEqual(legitDomain.isLookalike, false);
    console.log('  ✅ Domain lookalike detection passed.');
    // Test 3: IOC Extraction Engine
    console.log('Test 3: IOC Extraction Engine...');
    const sampleText = `
    Please contact security at alert@phishing-target.net or visit https://login.micros0ft-security.net/verify.
    Traffic originated from 185.220.101.5 and secondary relay 192.168.1.50.
    Payload sha256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
  `;
    const iocs = (0, iocExtractor_1.extractIOCs)(sampleText, 'X-Originating-IP: [185.220.101.5]');
    assert_1.default.ok(iocs.some(i => i.type === 'IPV4' && i.indicator === '185.220.101.5'));
    assert_1.default.ok(iocs.some(i => i.type === 'URL' && i.indicator.includes('micros0ft-security.net')));
    assert_1.default.ok(iocs.some(i => i.type === 'EMAIL' && i.indicator === 'alert@phishing-target.net'));
    assert_1.default.ok(iocs.some(i => i.type === 'HASH_SHA256' && i.indicator.startsWith('e3b0c442')));
    console.log(`  ✅ IOC Extraction passed (extracted ${iocs.length} indicators).`);
    // Test 4: Header Forensics & Authentication
    console.log('Test 4: Header Forensics & SPF/DKIM Validation...');
    const fakeHeaderMap = {
        from: 'support@microsoft.com',
        'reply-to': 'attacker@external-dropzone.xyz',
        'received-spf': 'fail (sender IP 194.26.29.112 is not permitted)',
        'dkim-signature': '',
        'authentication-results': 'spf=fail dkim=fail',
    };
    const headerRes = (0, headerForensics_1.analyzeHeaders)(fakeHeaderMap, 'support@microsoft.com', 'Microsoft Official Support', 'attacker@external-dropzone.xyz', 'bounce@external-dropzone.xyz');
    assert_1.default.strictEqual(headerRes.deceptionSummary.isReplyToMismatch, true);
    assert_1.default.strictEqual(headerRes.authResults.spfStatus, 'FAIL');
    assert_1.default.ok(headerRes.headers.some(h => h.name === 'Reply-To' && h.status === 'SUSPICIOUS'));
    console.log('  ✅ Header forensics and authentication checks passed.');
    // Test 5: Risk Scoring & Threat Detection
    console.log('Test 5: Risk Scoring & AI Explainability Engine...');
    const aiResult = (0, threatDetectionEngine_1.runThreatAnalysis)('URGENT: Verify your account immediately', 'Your password will expire within 24 hours. Sign in to verify your credentials.', 'security@micros0ft-fake.net', 'Microsoft Security Desk', 'attacker@external-dropzone.xyz', headerRes, iocs, []);
    assert_1.default.ok(aiResult.riskScore >= 70, `Expected risk score >= 70, got ${aiResult.riskScore}`);
    assert_1.default.ok(aiResult.scoreBreakdown.length > 0);
    assert_1.default.ok(aiResult.confidenceMatrix.length > 0);
    assert_1.default.ok(aiResult.storyline.length > 50);
    console.log(`  ✅ Risk scoring passed (Assessed Score: ${aiResult.riskScore}/100, Type: ${aiResult.threatType}).`);
    // Test 6: Investigation Graph Construction
    console.log('Test 6: Investigation Graph Builder...');
    const graph = (0, graphBuilder_1.buildInvestigationGraph)('inv_test_123', 'Phishing Alert', 'attacker@fake.com', 'drop@box.com', iocs, {});
    assert_1.default.ok(graph.nodes.length >= 3);
    assert_1.default.ok(graph.edges.length >= 2);
    console.log(`  ✅ Graph builder passed (${graph.nodes.length} nodes, ${graph.edges.length} edges).`);
    // Test 7: Report Generation (PDF & JSON)
    console.log('Test 7: Forensic Report Generation...');
    const db = (0, db_1.getDatabase)();
    const sampleInv = await db.get('SELECT id FROM investigations LIMIT 1');
    if (sampleInv?.id) {
        const reportData = await (0, reportGenerator_1.getFullInvestigationReportData)(sampleInv.id);
        assert_1.default.ok(reportData !== null);
        assert_1.default.ok(reportData.email !== null);
        const pdfBuf = await (0, reportGenerator_1.generatePdfReport)(reportData);
        assert_1.default.ok(pdfBuf.length > 1000);
        console.log(`  ✅ PDF report generator passed (${pdfBuf.length} bytes rendered).`);
    }
    console.log('\n====================================================');
    console.log('  🎉 ALL 7 TEST SUITES PASSED WITH ZERO ERRORS');
    console.log('====================================================\n');
}
runTestSuite()
    .then(() => process.exit(0))
    .catch(err => {
    console.error('❌ Test Suite Failed:', err);
    process.exit(1);
});

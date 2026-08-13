"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ssrf_validator_1 = require("../../packages/security/src/ssrf-validator");
describe('SSRF Protection Validator Unit Tests', () => {
    it('should block localhost (127.0.0.1)', async () => {
        const res = await (0, ssrf_validator_1.isSafeDestinationUrl)('http://127.0.0.1:4000/internal');
        expect(res.safe).toBe(false);
    });
    it('should block AWS cloud metadata IP (169.254.169.254)', async () => {
        const res = await (0, ssrf_validator_1.isSafeDestinationUrl)('http://169.254.169.254/latest/meta-data/');
        expect(res.safe).toBe(false);
    });
    it('should block private RFC1918 class A IP (10.0.0.1)', async () => {
        const res = await (0, ssrf_validator_1.isSafeDestinationUrl)('http://10.0.0.1/admin');
        expect(res.safe).toBe(false);
    });
    it('should allow valid public HTTPS URL', async () => {
        const res = await (0, ssrf_validator_1.isSafeDestinationUrl)('https://httpbin.org/post');
        expect(res.safe).toBe(true);
    });
});
//# sourceMappingURL=ssrf-validator.spec.js.map
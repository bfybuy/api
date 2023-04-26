"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const rateLimitConfig = {
    global: true,
    ban: 2,
    nameSpace: 'ipu-rate-limit-',
    onExceeding: () => { },
    onExceeded: () => { },
    onBanReach: () => { },
    allowList: (_a = process.env.RATE_LIMIT_ALLOW_LIST) === null || _a === void 0 ? void 0 : _a.split(','),
    max: parseInt(process.env.RATE_LIMIT_MAX_CALLS),
    timeWindow: process.env.RATE_LIMIT_TIME_WINDOW,
};
exports.default = rateLimitConfig;

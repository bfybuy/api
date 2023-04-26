"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const database_1 = __importDefault(require("./plugins/database"));
const rate_limit_1 = __importDefault(require("./config/rate-limit"));
const config_1 = __importDefault(require("./plugins/config"));
const rate_limit_2 = __importDefault(require("@fastify/rate-limit"));
const telegram_1 = __importDefault(require("./plugins/telegram"));
const api_1 = require("./api");
const view_1 = __importDefault(require("./config/view"));
const path_1 = __importDefault(require("path"));
const static_1 = __importDefault(require("@fastify/static"));
async function app(options) {
    const fastify = (0, fastify_1.default)(options);
    await fastify.register(config_1.default, { namespace: 'PARLINE_PRIVATE', ...options });
    await fastify.register(rate_limit_2.default, rate_limit_1.default);
    fastify.register(database_1.default);
    fastify.register(telegram_1.default);
    fastify.register(require('@fastify/formbody'));
    fastify.register(require('@fastify/view'), view_1.default);
    fastify.register(api_1.apiRoutes, { prefix: '/v1' });
    fastify.register(static_1.default, {
        root: path_1.default.resolve('public'),
        prefix: '/public/',
        cacheControl: false,
    });
    return fastify;
}
exports.default = app;

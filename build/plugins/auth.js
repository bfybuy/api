"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const bearer_auth_1 = __importDefault(require("@fastify/bearer-auth"));
exports.default = (0, fastify_plugin_1.default)(async function (fastify, opts) {
    const keys = new Set([process.env.ADMIN_API_KEY]);
    fastify.register(bearer_auth_1.default, { keys });
});

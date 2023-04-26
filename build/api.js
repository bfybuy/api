"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRoutes = void 0;
const script_route_1 = __importDefault(require("./scripts/script.route"));
const template_route_1 = __importDefault(require("./templates/template.route"));
const apiRoutes = async (fastify, options) => {
    fastify.register(script_route_1.default, { prefix: '/scripts' });
    fastify.register(script_route_1.default, { prefix: '/compare' });
    fastify.register(template_route_1.default, { prefix: '/template', data: { text: "text" } });
};
exports.apiRoutes = apiRoutes;

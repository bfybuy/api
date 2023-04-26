"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const qs_1 = __importDefault(require("qs"));
const templateRoutes = async (fastify, _options) => {
    fastify.post('/telegram', (req, reply) => {
        reply.view('/templates/table.ejs', { data: qs_1.default.parse(req.body) });
    });
};
exports.default = templateRoutes;

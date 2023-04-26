"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compare_controller_1 = __importDefault(require("./compare.controller"));
const compareRoutes = async (fastify, _options) => {
    fastify.post('/compare', compare_controller_1.default.create);
};
exports.default = compareRoutes;

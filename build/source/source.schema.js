"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SourceSchema = new mongoose_1.default.Schema({
    name: String,
    website: String,
    description: String,
    last_crawled: Date
});
exports.default = SourceSchema;

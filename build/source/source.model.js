"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Source = void 0;
const source_schema_1 = __importDefault(require("./source.schema"));
const mongoose_1 = require("mongoose");
const Source = mongoose_1.models.Sources || (0, mongoose_1.model)('Sources', source_schema_1.default);
exports.Source = Source;

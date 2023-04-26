"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const category_schema_1 = __importDefault(require("./category.schema"));
const mongoose_1 = require("mongoose");
const Category = mongoose_1.models.Categories || (0, mongoose_1.model)('Categories', category_schema_1.default);
exports.Category = Category;

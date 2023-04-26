"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const product_schema_1 = __importDefault(require("./product.schema"));
const mongoose_1 = require("mongoose");
const Product = mongoose_1.models.Products || (0, mongoose_1.model)('Products', product_schema_1.default);
exports.Product = Product;

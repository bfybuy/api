"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ProductSchema = new mongoose_1.default.Schema({
    name: String,
    description: String,
    price: String,
    category: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Categories'
    },
    picture: [String],
    url: String,
    source: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Sources'
    },
    size: String,
    meta: Array
}, {
    timestamps: true
});
exports.default = ProductSchema;

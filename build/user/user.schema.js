"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    firstname: String,
    lastname: String,
    email: {
        unique: true,
        type: String
    },
    phone: {
        type: String,
        unique: true
    },
    agent: {
        type: String,
        enum: ['Web', 'Telegram', 'WhatsApp']
    }
});
exports.default = UserSchema;

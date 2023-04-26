"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const user_schema_1 = __importDefault(require("./user.schema"));
const mongoose_1 = require("mongoose");
const User = mongoose_1.models.Users || (0, mongoose_1.model)('Users', user_schema_1.default);
exports.User = User;

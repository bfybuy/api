"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../user/user.model");
const UserService = {
    storeUser(msg) {
        var _a;
        const existing = user_model_1.User.find({
            email: msg.from.email,
            firstname: msg.from.first_name,
            lastname: msg.from.last_name
        });
        if (!existing || existing.length === 0) {
            console.log('User does not exist ');
            const user = new user_model_1.User({
                firstname: msg.from.first_name,
                lastname: msg.from.last_name,
                agent: 'Telegram',
                email: (_a = msg === null || msg === void 0 ? void 0 : msg.from) === null || _a === void 0 ? void 0 : _a.email
            });
            user.save();
        }
    }
};
exports.default = UserService;

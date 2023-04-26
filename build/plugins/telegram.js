"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const compare_service_1 = __importDefault(require("../compare/compare.service"));
const user_service_1 = __importDefault(require("../user/user.service"));
const generator_1 = __importDefault(require("../templates/generator"));
async function Telegram(fastify, options, done) {
    const TOKEN = process.env.TG_TOKEN;
    const bot = new node_telegram_bot_api_1.default(TOKEN);
    bot.setWebHook(`${process.env.SSL_APP_URL}/bot${TOKEN}`);
    fastify.post(`/bot${TOKEN}`, (req, reply) => {
        bot.processUpdate(req.body);
        reply.send({}).status(200);
    });
    bot.on('message', async (msg) => {
        var _a;
        user_service_1.default.storeUser(msg);
        if ((_a = msg.text) === null || _a === void 0 ? void 0 : _a.includes('\n')) {
            const results = await compare_service_1.default.performDBLookup(msg.text);
            const sortedResults = await compare_service_1.default.sortAlgorithm(results);
            const url = await generator_1.default.table(sortedResults);
            console.log('Returned URL for file is ', url);
            bot.sendMessage(msg.chat.id, `We've found the best stores to purchase your grocery items from!!`);
            bot.sendPhoto(msg.chat.id, url);
        }
        else {
            bot.sendMessage(msg.chat.id, `Sorry but I couldn't find a list in your message. Try again by typing your groceries like this: \n\nEggs\nSpinach\nTurkey\nMilk`);
        }
    });
}
exports.default = (0, fastify_plugin_1.default)(Telegram, { name: 'telegram-bot' });

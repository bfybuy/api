"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const mongoose_1 = __importDefault(require("mongoose"));
async function Mongodb(fastify, options, done) {
    try {
        const mongodb = await mongoose_1.default.connect(process.env.DB_URL);
        if (!fastify.mongodb) {
            fastify.decorate('mongodb', mongodb);
        }
        fastify.addHook('onClose', async (fastify, done) => {
            mongoose_1.default.disconnect().then(done).catch(done);
            fastify.log.info('Database connection closed');
        });
        fastify.log.info('Successfully connected to database');
    }
    catch (err) {
        fastify.log.error(err);
    }
    finally {
        done();
    }
}
exports.default = (0, fastify_plugin_1.default)(Mongodb, { name: 'bfybuy-mongodb' });

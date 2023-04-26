"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const start = async () => {
    const server = await (0, app_1.default)({
        pluginTimeout: 15000,
        logger: {
            level: 'info',
            transport: {
                target: 'pino-pretty',
            },
        }
    });
    try {
        await server.listen({
            host: '0.0.0.0',
            port: parseInt(process.env.APP_PORT),
        });
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();

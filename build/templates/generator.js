"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const qs_1 = __importDefault(require("qs"));
const GeneratorImage = {
    async table(postData) {
        var _a;
        const browser = await puppeteer_1.default.launch({
            headless: true,
            executablePath: (_a = process.env) === null || _a === void 0 ? void 0 : _a.CHROMIUM_PATH,
            args: ['--no-sandbox'],
        });
        const page = await browser.newPage();
        await page.setViewport({
            width: 500,
            height: 844,
            isMobile: true
        });
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');
        await page.setRequestInterception(true);
        page.once('request', async (request) => {
            var data = {
                'method': 'POST',
                'postData': qs_1.default.stringify(postData),
                'headers': {
                    ...request.headers(),
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            };
            request.continue(data);
            await page.setRequestInterception(false);
        });
        const pic_path = path_1.default.resolve('public/table.jpeg');
        await Promise.all([
            await page.goto(process.env.SSL_APP_URL + '/v1/template/telegram'),
            await page.screenshot({ path: pic_path }),
            await page.close()
        ]);
        console.log('Finished generating picture');
        return process.env.SSL_APP_URL + '/public/table.jpeg';
    }
};
exports.default = GeneratorImage;

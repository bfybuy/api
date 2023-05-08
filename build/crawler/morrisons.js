"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const dotenv = __importStar(require("dotenv"));
const utils_1 = require("./utils");
dotenv.config();
(async () => {
    var _a, _b;
    const browser = await puppeteer_1.default.launch();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');
    await page.goto('https://groceries.morrisons.com', {
        timeout: 100000
    });
    const navLinks = await page.$$('.primaryBar-container a');
    const navbarurls = [];
    const ocadoProducts = [];
    const ocadoFailedUrls = [];
    const urls = [];
    try {
        console.log(`Found ${navLinks.length} links`);
        for (const link of navLinks) {
            const url = await page.evaluate(link => link.href, link);
            console.log(url);
            navbarurls.push(url);
            const categoryPage = await browser.newPage();
            console.log(`Going to URL ${url}`);
            await categoryPage.goto(url, {
                timeout: 100000
            });
            const scripts = await categoryPage.$$('script');
            let matchingScript = null;
            for (const script of scripts) {
                const content = await categoryPage.evaluate(script => script.innerHTML, script);
                if (/window\.INITIAL_STATE\s*=\s*\{/.test(content)) {
                    matchingScript = script;
                    break;
                }
            }
            let cleanedContent;
            if (matchingScript) {
                const content = await categoryPage.evaluate(script => script.innerHTML, matchingScript);
                cleanedContent = content.replaceAll(';', '');
                cleanedContent = cleanedContent.replace('=', '');
                cleanedContent = cleanedContent.replaceAll('window.INITIAL_STATE ', '');
                const json = JSON.parse(cleanedContent);
                const collection = json.catalogue.productsPagesByRoute;
                const productKey = Object.keys(collection)[0];
                const sections = (_a = collection[productKey]) === null || _a === void 0 ? void 0 : _a.mainFopCollection.sections;
                const totalProducts = (_b = collection[productKey]) === null || _b === void 0 ? void 0 : _b.mainFopCollection.totalFops;
                console.log(`We should have ${totalProducts} products from this ${url}`);
                const skus = [];
                for (const key in sections) {
                    if (Object.hasOwnProperty.call(sections, key)) {
                        const section = sections[key];
                        if (Array.isArray(section.fops)) {
                            for (let i = 0; i < section.fops.length; i++) {
                                const fop = section.fops[i];
                                const sku = fop.sku;
                                skus.push(sku);
                            }
                        }
                    }
                }
                for (let index = 0; index < skus.length; index += 11) {
                    const eleven = skus.slice(index, index + 11);
                    const qs = eleven.join(',');
                    const url = `https://groceries.morrisons.com/webshop/api/v1/products?skus=${qs}`;
                    urls.push(url);
                }
                console.log('Array of urls size is ', urls.length);
                while (urls.length > 0) {
                    const batch = urls.splice(0, 5);
                    const pages = await Promise.all(batch.map(url => browser.newPage()));
                    await Promise.all(pages.map((page, index) => page.goto(batch[index])));
                    let data = await Promise.all(pages.map(async (page) => {
                        const body = await page.$('body');
                        const html = await page.evaluate(body => body.textContent, body);
                        const data = JSON.parse(html);
                        return data;
                    }));
                    console.log(data.length, ' is data length');
                    for (const products of data) {
                        products.forEach(product => {
                            var _a, _b;
                            ocadoProducts.push({
                                title: product.name,
                                link: `https://groceries.morrisons.com/products/${product.sku}`,
                                images: [],
                                price: product.price,
                                size: product === null || product === void 0 ? void 0 : product.catchWeight,
                                category: product === null || product === void 0 ? void 0 : product.mainCategory,
                                offer: product === null || product === void 0 ? void 0 : product.offer,
                                reviews: {
                                    ratings: (_a = product.reviewStats) === null || _a === void 0 ? void 0 : _a.averageRate,
                                    count: (_b = product.reviewStats) === null || _b === void 0 ? void 0 : _b.count
                                },
                                productMeta: product.packInfo
                            });
                        });
                    }
                    (0, utils_1.writeToFile)('morrisons-v1', ocadoProducts);
                    await Promise.all(pages.map(page => page.close()));
                    await (await browser.createIncognitoBrowserContext()).close();
                }
                (0, utils_1.writeToFile)('morrisons-v1', ocadoProducts);
                (0, utils_1.writeToFile)('morrisons-failed-urls', ocadoFailedUrls);
            }
            else {
                console.log('No matching script tag found');
            }
        }
    }
    catch (error) {
        console.log('An error occurred ', error);
        (0, utils_1.writeToFile)('morrisons-link', navbarurls);
        (0, utils_1.writeToFile)('morrisons-failed-urls', ocadoFailedUrls);
        (0, utils_1.writeToFile)('morrisons-v1', ocadoProducts);
    }
    (0, utils_1.writeToFile)('morrisons-link', navbarurls);
    (0, utils_1.writeToFile)('morrisons-failed-urls', ocadoFailedUrls);
    (0, utils_1.writeToFile)('morrisons-v1', ocadoProducts);
    (0, utils_1.sendNotification)(`Crawling Morrisons is done!! Crawled a total of ${ocadoProducts.length} products successfully!!`);
    await browser.close();
})();

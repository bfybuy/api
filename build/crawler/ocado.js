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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
(async () => {
    var _a, _b;
    const browser = await puppeteer_1.default.launch();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');
    await page.goto('https://www.ocado.com', {
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
                    const url = `https://www.ocado.com/webshop/api/v1/products?skus=${qs}`;
                    urls.push(url);
                }
                console.log('Array of urls size is ', urls.length);
                while (urls.length > 0) {
                    const batch = urls.splice(0, 5);
                    console.log('Batch url is ', batch);
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
                                link: `https://www.ocado.com/products/${product.sku}`,
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
                    writeToFile('ocado-v3', ocadoProducts);
                    await Promise.all(pages.map(page => page.close()));
                    await (await browser.createIncognitoBrowserContext()).close();
                }
                writeToFile('ocado-v3', ocadoProducts);
                writeToFile('ocado-failed-urls', ocadoFailedUrls);
            }
            else {
                console.log('No matching script tag found');
            }
        }
    }
    catch (error) {
        console.log('An error occurred ', error);
        writeToFile('ocado-links', navbarurls);
        writeToFile('ocado-failed-urls', ocadoFailedUrls);
        writeToFile('ocado-v3', ocadoProducts);
    }
    writeToFile('ocado-links', navbarurls);
    writeToFile('ocado-failed-urls', ocadoFailedUrls);
    writeToFile('ocado-v3', ocadoProducts);
    sendNotification(`Crawling done!! Crawled a total of ${ocadoProducts.length} products successfully!!`);
    await browser.close();
})();
function writeToFile(filename, content) {
    const directory = path_1.default.resolve('./data');
    fs_1.default.writeFile(`${directory}/${filename}.json`, JSON.stringify(content, this, "\t"), { flag: 'w' }, err => {
        if (err) {
            console.error('Failed to write to file', err);
            return;
        }
    });
}
function sendNotification(msg = 'Crawling is finished') {
    aws_sdk_1.default.config.update({
        accessKeyId: process.env.AWS_KEY_ID,
        secretAccessKey: process.env.AWS_ACCESS_ID,
        region: 'us-west-2'
    });
    var params = {
        Message: msg,
        TopicArn: 'arn:aws:sns:us-west-2:327676338247:CrawlerNotification'
    };
    var publishTextPromise = new aws_sdk_1.default.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
    publishTextPromise.then((data) => {
        console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
        console.log("MessageID is " + data.MessageId);
    }).catch((err) => {
        console.error(err, err.stack);
    });
}

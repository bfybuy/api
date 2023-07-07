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
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
const utils_1 = require("./utils");
dotenv.config();
(async () => {
    const browser = await puppeteer_1.default.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');
    await page.goto('https://groceries.aldi.co.uk/en-GB', {
        timeout: 100000
    });
    await page.setViewport({
        height: 900,
        width: 1440
    });
    const categories = [];
    const products = [];
    const menuList = await page.$$('header .main-nav nav.navbar ul#level1 li.nav-item.dropdown');
    console.log('Selected menu list total of ', menuList.length);
    for (const menu of menuList) {
        await menu.hover();
        const subLinks = await menu.$$('ul.main-dropdown-menu.dropdown-menu li div.main-nav-content ul#level2 li.level2Menu a.d-lg-block');
        for (const link of subLinks) {
            const url = await link.evaluate(link => link.href, link);
            if (url.includes('groceries.aldi.co.uk') && !categories.includes(url)) {
                categories.push(url);
            }
        }
        console.log('Created a total of', categories.length, ' unique categories');
    }
    console.log('Crawled categories of length ', categories.length);
    while (categories.length > 0) {
        const batch = categories.splice(0, 5);
        const pages = await Promise.all(batch.map(url => browser.newPage()));
        await Promise.all(pages.map((page, index) => page.goto(batch[index], {
            timeout: 1000000
        })));
        let categoryName = await Promise.all(pages.map(async (page) => {
            const filter = await page.$('#selectedSearchFacetsContainer');
            const categoryFacet = await page.evaluate((filter) => {
                var _a;
                console.log('Filter dataset ', filter === null || filter === void 0 ? void 0 : filter.dataset);
                return (_a = filter === null || filter === void 0 ? void 0 : filter.dataset) === null || _a === void 0 ? void 0 : _a.context;
            }, filter);
            console.log('Category Facet ', categoryFacet);
            if (!categoryFacet) {
                return false;
            }
            const category = JSON.parse(categoryFacet);
            console.log('Category facet on sidebar is ', category.SelectedFacetsViewModel.Facets[0].DisplayName);
            return category.SelectedFacetsViewModel.Facets[0].DisplayName;
        }));
        for (let i = 0; i < categoryName.length; i++) {
            const category = categoryName[i];
            let pageNum = 1;
            let hasMorePages = true;
            while (hasMorePages) {
                try {
                    console.log('Querying products from ', category);
                    const paginatedRequests = await browser.newPage();
                    await paginatedRequests.goto('https://groceries.aldi.co.uk/api/aldisearch/search');
                    const axiosResponse = await axios_1.default.post('https://groceries.aldi.co.uk/api/aldisearch/search', {
                        QueryString: `?&page=${pageNum}`,
                        CategoryId: category
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
                            'X-Requested-With': 'XMLHttpRequest',
                            'Accept-Language': 'en-GB'
                        }
                    });
                    const responseData = axiosResponse.data;
                    console.log('Products in set = ', responseData.ProductSearchResults.TotalCount);
                    const total = responseData.ProductSearchResults.Pagination.TotalNumberOfPages;
                    if (total === 0) {
                        hasMorePages = false;
                    }
                    const SearchResults = responseData.ProductSearchResults.SearchResults;
                    for (let i = 0; i < SearchResults.length; i++) {
                        const product = SearchResults[i];
                        products.push({
                            title: product.FullDisplayName,
                            link: `https://groceries.aldi.co.uk/en-GB/${product.Url}`,
                            images: [product.ImageUrl],
                            price: {
                                "current": product.DefaultListPrice || product.DisplayPrice,
                                "unit": {
                                    "price": product.UnitPrice,
                                    "per": product.UnitPriceDeclaration
                                },
                            },
                            size: product === null || product === void 0 ? void 0 : product.SizeVolume,
                            category: product === null || product === void 0 ? void 0 : product.DefinitionName
                        });
                    }
                    (0, utils_1.writeToFile)('aldi', products);
                    console.log('Total pages is ', total);
                    pageNum += 1;
                    hasMorePages = pageNum <= total;
                    console.log(`Going to fetch page ${pageNum} out of ${total}`);
                    (0, utils_1.writeToFile)('aldi', products);
                }
                catch (error) {
                    hasMorePages = false;
                    (0, utils_1.writeToFile)('aldi', products);
                    console.log('Error ', error);
                    (0, utils_1.sendNotification)(`Crawling Aldi ran into an error!! Crawled a total of ${products.length} products in the meantime. Please check the logs`);
                }
            }
        }
        await Promise.all(pages.map(page => page.close()));
        await (await browser.createIncognitoBrowserContext()).close();
    }
    await browser.close();
    (0, utils_1.writeToFile)('aldi', products);
    (0, utils_1.sendNotification)(`Crawling aldi is done!! Crawled a total of ${products.length} products successfully!`);
})();

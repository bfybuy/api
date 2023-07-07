"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const product_model_1 = require("../product/product.model");
require("core-js/proposals/array-grouping-stage-3-2");
const CompareService = {
    async bot(payload) {
        const results = await this.performDBLookup(payload);
        const sorted = await this.sortAlgorithm(results);
        return sorted;
    },
    async performDBLookup(msg) {
        let results = [];
        const list = msg.split('\n');
        for (let index = 0; index < list.length; index++) {
            const listItem = list[index];
            const productIds = await product_model_1.Product.distinct('name', {
                $or: [
                    { name: new RegExp(listItem, 'i') }
                ]
            })
                .exec();
            const products = await product_model_1.Product.find({
                name: {
                    $in: productIds
                }
            })
                .select('name price size picture source')
                .populate('source')
                .exec();
            results.push({ search: listItem, matches: products });
        }
        return results;
    },
    async sortAlgorithm(data) {
        const response = [];
        const uniqueSources = [];
        const responseBody = [];
        const search = [];
        data.forEach((product) => {
            if (!product.matches || product.matches.length === 0) {
                return;
            }
            search.push(product.search);
            console.log('Uncleaned matches for ', product.search, 'are ', product.matches.length);
            const cleanedProducts = product.matches.filter(item => item.price && item.size && item.size.length > 1 && item.price.current > 1 && item.size !== null);
            console.log('Cleaned products is ', cleanedProducts.length);
            const sortedResults = cleanedProducts === null || cleanedProducts === void 0 ? void 0 : cleanedProducts.sort((a, b) => {
                a = CompareService.pricePerUnit(a);
                b = CompareService.pricePerUnit(b);
                return (a === null || a === void 0 ? void 0 : a.cost_per_unit) > (b === null || b === void 0 ? void 0 : b.cost_per_unit) ? 1 : -1;
            });
            const bestThree = sortedResults.slice(0, 2);
            for (let x = 0; x < bestThree.length; x++) {
                const item = bestThree[x];
                if (uniqueSources.length === 3) {
                    return uniqueSources;
                }
                const sourceExists = uniqueSources.includes(item.source.name);
                if (!sourceExists) {
                    uniqueSources.push(item.source.name);
                }
            }
            const row = [];
            if (sortedResults.length === 0) {
                return;
            }
            for (let y = 0; y < sortedResults.length; y++) {
                const product = sortedResults[y];
                for (let z = 0; z < uniqueSources.length; z++) {
                    const source = uniqueSources[z];
                    if (!source) {
                        continue;
                    }
                    const exists = row.some(item => { var _a; return ((_a = item.source) === null || _a === void 0 ? void 0 : _a.name) === source; });
                    if (row.length === uniqueSources.length) {
                        return;
                    }
                    if (product.source.name === source && !exists) {
                        product.cost_rate = CompareService.pricePerUnit(product);
                        row.push(product);
                    }
                }
                const doesExist = responseBody.some((arr) => arr.length === row.length && arr.every((val, index) => val === row[index]));
                if (!doesExist) {
                    responseBody.push(row);
                }
            }
        });
        let headers = uniqueSources;
        headers.unshift('Item');
        const cheapest = headers.slice(1).map(source => {
            return {
                source,
                cheapest: false,
                text: 0
            };
        });
        const rowBody = responseBody.map((products, index) => {
            const cheapestProduct = products.reduce((min, item) => {
                var _a;
                return ((_a = item === null || item === void 0 ? void 0 : item.cost_rate) === null || _a === void 0 ? void 0 : _a.cost_per_unit) < min ? item : min;
            }, products[0]);
            const cheapest_source = cheapest.filter(product_source => product_source.source === cheapestProduct.source.name).reduce(c => c);
            cheapest_source.text += 1;
            products.unshift(search[index]);
            return products.map(item => {
                var _a, _b, _c;
                if (item.price && !item.cost_rate) {
                    console.log('Item ', item.name, ' for ', item.price, ' has a price but no cost_rate ', item.cost_rate, ' and maybe has a size? ', item.size);
                    return false;
                }
                return {
                    name: (item === null || item === void 0 ? void 0 : item.name) || item,
                    cost_rate: item.cost_rate ? `${(_a = item.cost_rate) === null || _a === void 0 ? void 0 : _a.cost_per_unit_string}/${(_b = item.cost_rate) === null || _b === void 0 ? void 0 : _b.unit}` : item,
                    source: ((_c = item === null || item === void 0 ? void 0 : item.source) === null || _c === void 0 ? void 0 : _c.name) || item,
                    ...((cheapestProduct === null || cheapestProduct === void 0 ? void 0 : cheapestProduct.name) === (item === null || item === void 0 ? void 0 : item.name) && { cheapest: true })
                };
            });
        });
        console.log('row body array should be => rowBody => ', rowBody);
        console.log('Cheapest items array => ', cheapest);
        response.push(headers);
        response.push(...rowBody);
        const responseFooter = [
            { text: 'Number of items with the lowest cost per unit' },
        ];
        response.push(responseFooter.concat(cheapest));
        console.log('Final response looks like ', response);
        return response;
    },
    extractPriceWithoutSymbol(price) {
        if (typeof price !== 'string') {
            return price;
        }
        if (price === null || price === void 0 ? void 0 : price.includes('£')) {
            price = parseFloat(price === null || price === void 0 ? void 0 : price.slice(1));
        }
        else if (price === null || price === void 0 ? void 0 : price.includes('p')) {
            price = parseFloat(price === null || price === void 0 ? void 0 : price.slice(0, -1));
            price = price / 100;
        }
        else {
            price = parseFloat(price);
        }
        return price;
    },
    pricePerUnit(product) {
        const price = CompareService.extractPriceWithoutSymbol(product.price.current);
        const number = new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        });
        const cost_per_unit = CompareService.extractPriceWithoutSymbol(product.price.unit.price);
        let unit = product.price.unit.per;
        if (unit.includes('per')) {
            unit = unit.split(' ')[1];
        }
        const cost_per_unit_string = number.format(cost_per_unit);
        return {
            unit,
            price,
            cost_per_unit,
            cost_per_unit_string,
        };
    }
};
exports.default = CompareService;

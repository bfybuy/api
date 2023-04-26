"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const product_model_1 = require("../product/product.model");
const source_model_1 = require("../source/source.model");
const path = require('path');
const fs = require('fs');
const scriptRoutes = async (fastify, _options) => {
    fastify.post('/import', async function (res, reply) {
        const file = path.resolve('./data/products.json');
        let data = await fs.readFileSync(file, { encoding: 'utf-8' }, (err, data) => data);
        let count = 0;
        data = JSON.parse(data);
        const source = await new source_model_1.Source({
            name: 'Aldi',
            website: 'https://groceries.aldi.co.uk/en-GB/',
            description: '',
            last_crawled: '2023-04-14'
        });
        source.save();
        const productData = [];
        data.map(product => {
            count++;
            productData.push({
                name: product.title,
                picture: product.images,
                url: product.link.url,
                price: product.price,
                size: product.size,
                source,
                meta: product.productMeta
            });
        });
        await product_model_1.Product.insertMany(productData, {
            ordered: false,
            populate: 'source'
        });
        reply.send({ message: `Created ${count} products` });
    });
    fastify.post('/import/ocado', async function (res, reply) {
        const file = path.resolve('./data/uk_grocery_products.json');
        let data = await fs.readFileSync(file, { encoding: 'utf-8' }, (err, data) => data);
        let count = 0;
        data = JSON.parse(data);
        const source = await new source_model_1.Source({
            name: 'Ocado',
            website: 'https://www.ocado.com/',
            description: '',
            last_crawled: '2023-04-14'
        });
        source.save();
        const productData = [];
        data.map(product => {
            var _a;
            count++;
            const images = [product.product_image];
            let price = null;
            let name = product.title;
            let size = null;
            if (product.title.match(/\d+g/)) {
                size = product.title.match(/\d+g/)[0];
                name = product.title.match(/^(.*?)\d+g/)[1];
            }
            if (product.title.match(/\d+l/)) {
                size = product.title.match(/\d+l/)[0];
                name = product.title.match(/^(.*?)\d+l/)[1];
            }
            if (product.title.match(/\d+ml/)) {
                size = product.title.match(/\d+ml/)[0];
                name = product.title.match(/^(.*?)\d+ml/)[1];
            }
            if (product.title.match(/\d+cl/)) {
                size = product.title.match(/\d+cl/)[0];
                name = product.title.match(/^(.*?)\d+cl/)[1];
            }
            if (product.price.includes('p')) {
                price = product.price;
            }
            else {
                price = '£' + product.price;
            }
            productData.push({
                name: name,
                picture: images,
                url: (_a = product === null || product === void 0 ? void 0 : product.link) === null || _a === void 0 ? void 0 : _a.url,
                price: price,
                size: size,
                source,
                meta: product === null || product === void 0 ? void 0 : product.productMeta
            });
        });
        await product_model_1.Product.insertMany(productData, {
            ordered: false,
            populate: 'source'
        });
        reply.send({ message: `Created ${count} products` });
    });
};
exports.default = scriptRoutes;

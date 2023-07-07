"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const product_model_1 = require("../product/product.model");
const source_model_1 = require("../source/source.model");
const path = require('path');
const fs = require('fs');
const scriptRoutes = async (fastify, _options) => {
    fastify.post('/import', async function (res, reply) {
        const directory = path.resolve('./data');
        try {
            product_model_1.Product.collection.drop()
                .then(() => { console.log('Dropped products collection'); })
                .catch(() => { console.error('Failed to drop products collection'); });
            fs.readdir(directory, async (error, files) => {
                if (error) {
                    console.error('Error reading data directory: ', error);
                    return;
                }
                files.map(async (file) => {
                    const fileDir = path.join(directory, file);
                    let products = await fs.readFileSync(fileDir, { encoding: 'utf-8' }, (error, data) => data);
                    console.log('Processing ', file);
                    products = JSON.parse(products);
                    file = file.split('.')[0];
                    const source = await new source_model_1.Source({
                        name: file.charAt(0).toUpperCase() + file.slice(1),
                        description: '',
                        last_crawled: new Date()
                    });
                    source.save();
                    const productData = [];
                    products.forEach(product => {
                        var _a;
                        let images;
                        if (file.includes('waitrose')) {
                            const imageUrls = product.images;
                            images = Object.entries(imageUrls).map(([name, url]) => { return url; });
                        }
                        else {
                            images = product.images;
                        }
                        productData.push({
                            name: product.title,
                            picture: images,
                            url: product.link || ((_a = product.link) === null || _a === void 0 ? void 0 : _a.url),
                            price: product.price,
                            size: product.size,
                            source,
                            meta: product === null || product === void 0 ? void 0 : product.productMeta
                        });
                    });
                    console.log('Inserting ', productData.length, ' products');
                    product_model_1.Product.insertMany(productData).then((result) => {
                        console.log('Inserted ', result.length, ' documents');
                    })
                        .catch((error) => {
                        console.log('Error inserting documents: ', error);
                    });
                });
            });
        }
        catch (err) {
            console.error('An error occurred in file reader ', err);
        }
        reply.send({ message: `Creating products` });
    });
};
exports.default = scriptRoutes;

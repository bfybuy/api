import { FastifyInstance } from 'fastify'
// import { Category } from '../category/category.model'
import { Product } from '../product/product.model'
import { Source } from '../source/source.model'
const path = require('path')
const fs = require('fs')

/***
 * TODO: #1 There should be only one import route
 */
const scriptRoutes = async (fastify: FastifyInstance, _options: any) => {
	fastify.post('/import', async function(res, reply) {
		const file = path.resolve('./data/products.json')

		let data = await fs.readFileSync(file, { encoding: 'utf-8' }, (err: any, data: any) => data)

		let count = 0

		data = JSON.parse(data)

		const source = await new Source({
			name: 'Aldi',
			website: 'https://groceries.aldi.co.uk/en-GB/',
			description: '',
			last_crawled: '2023-04-14'
		})

		source.save()

		const productData = []

		data.map(product => {
			// Add the source
			// Add the categories
			// Add product
			count++

			productData.push({
				name: product.title,
				picture: product.images,
				url: product.link.url,
				price: product.price,
				size: product.size,
				source,
				meta: product.productMeta
			})
		})

		// @ts-ignore
		await Product.insertMany(productData, {
			ordered: false,
			populate: 'source'
		})

		reply.send({message: `Created ${count} products`})
	})

	fastify.post('/import/ocado', async function(res, reply) {
		const file = path.resolve('./data/uk_grocery_products.json')

		let data = await fs.readFileSync(file, { encoding: 'utf-8' }, (err: any, data: any) => data)

		let count = 0

		data = JSON.parse(data)

		const source = await new Source({
			name: 'Ocado',
			website: 'https://www.ocado.com/',
			description: '',
			last_crawled: '2023-04-14'
		})

		source.save()

		const productData = []

		data.map(product => {
			// Add the source
			// Add the categories
			// Add product
			count++

			const images = [product.product_image]

			let price = null
			let name = product.title
			let size = null

			// If product name ends with a 'g' (gram) size
			if(product.title.match(/\d+g/)) {
				size = product.title.match(/\d+g/)[0]
				name = product.title.match(/^(.*?)\d+g/)[1]
			}

			if(product.title.match(/\d+l/)) {
				size = product.title.match(/\d+l/)[0]
				name = product.title.match(/^(.*?)\d+l/)[1]
			}

			if(product.title.match(/\d+ml/)) {
				size = product.title.match(/\d+ml/)[0]
				name = product.title.match(/^(.*?)\d+ml/)[1]
			}

			if(product.title.match(/\d+cl/)) {
				size = product.title.match(/\d+cl/)[0]
				name = product.title.match(/^(.*?)\d+cl/)[1]
			}

			if(product.price.includes('p')) {
				price = product.price
			} else {
				price = '£' + product.price
			}

			productData.push({
				name: name,
				picture: images,
				url: product?.link?.url,
				price: price,
				size: size,
				source,
				meta: product?.productMeta
			})
		})

		// @ts-ignore
		await Product.insertMany(productData, {
			ordered: false,
			populate: 'source'
		})

		reply.send({message: `Created ${count} products`})
	})
}

export default scriptRoutes
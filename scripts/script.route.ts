import { FastifyInstance } from 'fastify'
// import { Category } from '../category/category.model'
import { Product } from '../product/product.model'
import { Source } from '../source/source.model'

const scriptRoutes = async (fastify: FastifyInstance, _options: any) => {
	fastify.post('/import', async function(res, reply) {
		const path = require('path')
		const fs = require('fs')

		const file = path.resolve('./data/products.json')

		let data = await fs.readFileSync(file, { encoding: 'utf-8' }, (err: any, data: any) => data)

		let count = 0

		data = JSON.parse(data)

		const source = await new Source({
			name: 'Click and Collect | Aldi',
			website: 'https://groceries.aldi.co.uk/en-GB/',
			description: '',
			last_crawled: '2023-04-14'
		})

		source.save()

		await Promise.all([
				data.map(async(product) => {
					// Add the source
					// Add the categories
					// Add product
					count++

					const productData = await new Product({
						name: product.title,
						picture: product.images,
						url: product.link.url,
						price: product.price,
						size: product.size,
						source,
						meta: product.productMeta
					})

					productData.save()
				})
		])

		reply.send({message: `Created ${count} products`})
	})
}

export default scriptRoutes
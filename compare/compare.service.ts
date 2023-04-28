import { Product } from '../product/product.model';
import 'core-js/proposals/array-grouping-stage-3-2'

const CompareService = {
	async bot(payload) {
		const results = await this.performDBLookup(payload)

		const sorted = await this.sortAlgorithm(results)

		return sorted
	},

	/**
	 * Perform a DB lookup with a list of newline delimited grocery items
	 * passed.
	 * TODO: 1. Don't return duplicates
	 * TODO: 2. Only return 50% matches
	 *
	 * TODO: #2 3. Look at https://www.mongodb.com/docs/manual/core/index-text/ to examine Mongo's search capabilities OR we may use elastic search
	 * @param msg \n Delimited string
	 * @returns Array
	 */
	async performDBLookup(msg: string) {
		let results = []
		const list = msg.split('\n')

		for (let index = 0; index < list.length; index++) {
			const listItem = list[index];

			// @ts-ignore
			const productIds = await Product.distinct('name', {
				// TODO: Only return at least 50% matches
				$or: [
					{ name: new RegExp(listItem, 'i') },
					{ "meta.Ingredients": new RegExp(listItem, 'i') }
				]
			})
			.exec()

			// @ts-ignore
			const products = await Product.find({
				name: {
					$in: productIds
				}
			})
			.select('name price size picture source')
			.populate('source')
			.exec();

			results.push({ search: listItem, matches: products })
		}

		return results
	},

	/**
	 * 3. Return the cheapest product based on price
	 *
	 * @param data
	 */
	async sortAlgorithm (data: { matches: any[]; search: string | number; }[]) {
		const response = []
		const uniqueSources = []
		const responseBody = []
		const search = []

		data.forEach((product: { matches: any[]; search: string | number; }) => {

			if (!product.matches || product.matches.length === 0) {
				return
			}

			// Push the search keyword
			search.push(product.search)

			console.log('Uncleaned matches for ', product.search, 'are ', product.matches.length)

			// Some products may not have a price (tough!) - so we have to remove them
			// Price or size has to be at least greater than 1 so we avoid (weird?) zero values
			const cleanedProducts = product.matches.filter(item => item.price && item.size && item.size.length > 1 && item.price.length > 1 && item.size !== null)

			console.log('Cleaned products is ', cleanedProducts.length)

			// Sort by cheapest per unit
			const sortedResults = cleanedProducts?.sort((a: { cost_per_unit: number; price: string;}, b: { cost_per_unit: number; price: string;}) => {
				a = CompareService.pricePerUnit(a)
				b = CompareService.pricePerUnit(b)

				// Sort a after b if a has a higher cost_per_unit than b
				return a?.cost_per_unit > b?.cost_per_unit ? 1 : -1
			})


			/**
			 * Our algorithm connotes that we will only return 3 best results. So we don't need to iterate all of the sorted result for one search.
			 * We can simply retrieve the first 3 items.
			 */
			const bestThree = sortedResults.slice(0, 2)

			/***
			 * Products are already sorted from cheapest to most expensive so the
			 * first items we iterate will be the cheapest we have.
			 */
			for (let x = 0; x < bestThree.length; x++) {
				const item = bestThree[x];

				// TODO: What if the source for 1 search does not have the result for the next search? We may have some sources empty, TBD
				// Our algorithm here assumes implies that the sources we found for the first product will be the same sources that must have the product
				// for the remaining search items.
				if (uniqueSources.length === 3) {
					return uniqueSources
				}

				const sourceExists = uniqueSources.includes(item.source.name)

				// source hasn't been pushed previously, so push it
				if (!sourceExists) {
					uniqueSources.push(item.source.name)
				}
			}

			const row = []

			if (sortedResults.length === 0) {
				return
			}

			for (let y = 0; y < sortedResults.length; y++) {
				const product = sortedResults[y]

				for (let z = 0; z < uniqueSources.length; z++) {
					const source = uniqueSources[z]

					if (!source) {
						continue
					}

					const exists = row.some(item => item.source?.name === source)

					if (row.length === uniqueSources.length) {
						return
					}

					if (product.source.name === source && !exists) {
						product.cost_rate = CompareService.pricePerUnit(product)
						row.push(product)
					}
				}

				// Don't insert duplicates
				const doesExist = responseBody.some((arr) =>
					arr.length === row.length && arr.every((val, index) => val === row[index])
				)

				if (!doesExist) {
					responseBody.push(row)
				}
			}
		})

		// Retrieve sources
		let headers = uniqueSources
		// Get unique headers across all products returned (<= 3)
		headers.unshift('Item')

		// Remove 'Item' from headers and change structure of array
		const cheapest = headers.slice(1).map(source => {
			return {
				source,
				cheapest: false,
				text: 0
			}
		})

		console.log('Search body is ,', search)

		const rowBody = responseBody.map((products, index) => {

			const cheapestProduct = products.reduce((min, item) => {
				return item?.cost_rate?.cost_per_unit < min ? item : min
			}, products[0]);

			// Find the source of the cheapest item in the product group, then increment the source's name
			const cheapest_source = cheapest.filter(product_source => product_source.source === cheapestProduct.source.name).reduce(c => c)
			cheapest_source.text += 1

			// Response body and search should have the same length
			products.unshift(search[index])

			return products.map(item => {
				if (item.price && !item.cost_rate) {
					console.log('Item ', item.name, ' for ', item.price, ' has a price but no cost_rate ', item.cost_rate, ' and maybe has a size? ', item.size)
					return false
				}

				return {
					name: item?.name || item,
					cost_rate: item.cost_rate ? `${item.cost_rate?.cost_per_unit_string}/100${item.cost_rate?.unit}` : item,
					source: item?.source?.name || item,
					...(cheapestProduct?.name === item?.name && { cheapest: true })
				}
			})
		})

		console.log('row body array should be => rowBody => ', rowBody)

		// Find which source's product has the most cheapest items
		console.log('Cheapest items array => ', cheapest)

		// Push responses
		response.push(headers)
		response.push(...rowBody)

		const responseFooter = [
			{ text: 'Number of items with the lowest cost per unit' },
		]

		response.push(
			// @ts-ignore
			responseFooter.concat(cheapest)
		)

		console.log('Final response looks like ', response)

		return response
	},

	/**
	 * Following the assumption that all matches for a search
	 * will have the same unit. For this, we have to be near-accurate
	 * with our searches. Refer to comment/issue about using Mongo text
	 * search or Elastic search
	 * @param product
	 */
	pricePerUnit (product) {
		let price = null

		// Get price from product and convert all to pounds
		if (product?.price?.includes('£')) {
			price = parseFloat(product.price?.slice(1))
		} else if (product?.price?.includes('p')) {
			price = parseFloat(product.price?.slice(0, -1))
			// 100 pence = 1 pound
			price = price / 100
		}

		// Get correct size from product

		// Regex to get whatever unit follows the size number
		// TODO: #3 Cater for processing products whose units are packs. e.g: 4 pack
		const regex = /\d+(\D+)/g

		// size: 900ml, unit: ml
		if (!product.size.match(regex)) {
			return
		}

		let [size, unit] = regex.exec(product.size)

		// Get the size without the unit using this weird method
		size = product.size.slice(0, unit.length + 1)

		const number = new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency: 'GBP'
		})

		const cost_per_unit = price / parseInt(size)
		const cost_per_unit_string = number.format(price / parseInt(size))

		return {
			unit,
			price, // in pounds
			cost_per_unit,
			cost_per_unit_string,
		}
	}
}

export default CompareService
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
			const product = await Product.find({
				// TODO: Only return at least 50% matches
				$or: [
					{ name: new RegExp(listItem, 'i') },
					{ "meta.Ingredients": new RegExp(listItem, 'i') }
				]
			}, 'name price size picture source')
			.populate('source')
			.exec()

			results.push({ search: listItem, matches: product })

			/**
			 *
			 * 	found 75 results for search Eggs
				found 107 results for search Spinach
				found 54 results for search Turkey
				found 398 results for search Milk
			 */
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

		data.map((product: { matches: any[]; search: string | number; }) => {
			product.matches.sort((a: { cost_per_unit: number; price: string; }, b: { cost_per_unit: number; price: string; }) => {

				// Some products may not have a price (tough!) - so we have to push them to the end
				if(!a.price) {
					return -1
				}

				a = CompareService.pricePerUnit(a)
				b = CompareService.pricePerUnit(b)

				// Sort a after b if a has a higher cost_per_unit than b
				return a.cost_per_unit > b.cost_per_unit ? 1 : -1
			})

			// pick the cheapest 3. What if more than 1 item from the match belongs to the same source
			const cheapestThree = product.matches.slice(0, 2)

			// Make sure only docs values are returned
			//_doc is the results only and discards any other mongo jargon
			cheapestThree.reduce(a => a?._doc)

			// @ts-ignore
			// response.push(cheapestThree.group(({ source }) => source.name))

			const rates = []

			cheapestThree.map(item => {
				rates.push({
					name: item.name,
					source: item.source.name,
					rates: [{
						size: item.size,
						price: item.price
					}]
				})
			})

			console.log('Rates are =>>> ', ...rates)
		})

		console.log('Resolved response body ', JSON.stringify(response))

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
		let [size, unit] = regex.exec(product.size)

		// Get the size without the unit using this weird method
		size = product.size.slice(0, unit.length + 1)

		const cost_per_unit = price / parseInt(size)

		return {
			unit: product.size,
			price, // in pounds
			cost_per_unit
		}
	}
}

export default CompareService
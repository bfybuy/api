import puppeteer from 'puppeteer';
import axios from 'axios'
import * as dotenv from 'dotenv'
import { writeToFile, sendNotification } from './utils';

dotenv.config();

(async () => {
  const browser = await puppeteer.launch({
	headless: false
  });
  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');

  await page.goto('https://groceries.aldi.co.uk/en-GB', {
	timeout: 100000
  })

  await page.setViewport({
	height: 900,
	width: 1440
  })

  	const categories = []
	const products = []

	const menuList = await page.$$('header .main-nav nav.navbar ul#level1 li.nav-item.dropdown')

	console.log('Selected menu list total of ', menuList.length)

  	for (const menu of menuList) {
		await menu.hover()

		// Select the a tags from the submenu. There are 2 links, one for mobile and another for desktop
		const subLinks = await menu.$$('ul.main-dropdown-menu.dropdown-menu li div.main-nav-content ul#level2 li.level2Menu a.d-lg-block')

		for (const link of subLinks) {
			const url = await link.evaluate(link => link.href, link)

			// Don't add links that are not for the grocery website and also don't add links that already exist
			if (url.includes('groceries.aldi.co.uk') && !categories.includes(url)) {
				categories.push(url)
			}
		}

		console.log('Created a total of', categories.length, ' unique categories')
	}

	console.log('Crawled categories of length ', categories.length)

	while(categories.length > 0) {
		// Batch the urls
		const batch = categories.splice(0, 5)

		const pages = await Promise.all(batch.map(url => browser.newPage()));

		await Promise.all(pages.map((page, index) => page.goto(batch[index], {
			timeout: 1000000
		})));

		// Process the data on each url
		let categoryName = await Promise.all(pages.map(async(page) => {

			// Get the category id to use for making requests to the search endpoint
			const filter = await page.$('#selectedSearchFacetsContainer')

			const categoryFacet = await page.evaluate((filter) => {
				console.log('Filter dataset ', filter?.dataset)
				return filter?.dataset?.context
			}, filter);

			console.log('Category Facet ', categoryFacet)

			if (!categoryFacet) {
				return false
			}

			const category = JSON.parse(categoryFacet)

			console.log('Category facet on sidebar is ', category.SelectedFacetsViewModel.Facets[0].DisplayName)

			return category.SelectedFacetsViewModel.Facets[0].DisplayName
		}))

		for (let i = 0; i < categoryName.length; i++) {
			const category = categoryName[i];

			// Set pagination params
			let pageNum = 1
			let hasMorePages = true

			while (hasMorePages) {
				try {
					console.log('Querying products from ', category)
					const paginatedRequests = await browser.newPage()
					await paginatedRequests.goto('https://groceries.aldi.co.uk/api/aldisearch/search')

					const axiosResponse = await axios.post('https://groceries.aldi.co.uk/api/aldisearch/search', {
							QueryString: `?&page=${pageNum}`,
							CategoryId: category
						},
						{
							headers: {
								'Content-Type': 'application/json',
								'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
								'X-Requested-With': 'XMLHttpRequest',
								'Accept-Language': 'en-GB'
							}
						}
					)

					const responseData = axiosResponse.data

					console.log('Products in set = ', responseData.ProductSearchResults.TotalCount)

					const total = responseData.ProductSearchResults.Pagination.TotalNumberOfPages

					// No product found, stop paginated requests and go to the next category
					if (total === 0) {
						hasMorePages = false
					}

					const SearchResults = responseData.ProductSearchResults.SearchResults

					for (let i = 0; i < SearchResults.length; i++) {
						const product = SearchResults[i]

						products.push({
							title: product.FullDisplayName,
							//`bfybuy` as used here is only a placeholder to satisfy waitroses's url structure
							link: `https://groceries.aldi.co.uk/en-GB/${product.Url}`,
							images: [product.ImageUrl],
							price: {
								"current": product.DefaultListPrice || product.DisplayPrice,
								"unit": {
									"price": product.UnitPrice,
									// Split a text like "£5/kg" into £5 and kg and retrieve the second item
									"per": product.UnitPriceDeclaration
								},
							},
							size: product?.SizeVolume,
							category: product?.DefinitionName
						})
					}

					writeToFile('aldi', products)

					console.log('Total pages is ', total)

					pageNum += 1
					hasMorePages = pageNum <= total

					console.log(`Going to fetch page ${pageNum} out of ${total}`)

					writeToFile('aldi', products)
				} catch (error) {
					hasMorePages = false
					writeToFile('aldi', products)
					console.log('Error ', error)
					sendNotification(`Crawling Aldi ran into an error!! Crawled a total of ${products.length} products in the meantime. Please check the logs`)
				}
			}
		}

		await Promise.all(pages.map(page => page.close()));
		await (await browser.createIncognitoBrowserContext()).close(); // Close the browser context to free up memory
	}

	// Close browser to clear memory
	await browser.close();


	writeToFile('aldi', products)

	// Process should be done here
	sendNotification(`Crawling aldi is done!! Crawled a total of ${products.length} products successfully!`)
})();
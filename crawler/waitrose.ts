import puppeteer from 'puppeteer';
import axios from 'axios'
import * as dotenv from 'dotenv'
import { writeToFile, sendNotification } from './utils';

dotenv.config();

(async () => {
  const browser = await puppeteer.launch({
	headless: false,
  });

  const page = await browser.newPage();

//   Important to set the viewport so the menu can be visible
  await page.setViewport({
	width: 1424,
	height: 768
  })

  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');

  await page.goto('https://www.waitrose.com/ecom/shop/browse/groceries', {
	timeout: 100000
  })

  const menuList = await page.$$('header .desktop___hFZNV .dropDownG1G2Hidden___SlyIA a')

	const ids = []
  	const categories = []
	const products = []
  	let crawledCategory = 0

  	for (const menu of menuList) {
		const categoryId = await page.evaluate(menu => menu.id, menu)
		ids.push(categoryId)

		const category = await page.evaluate(menu => menu.textContent, menu)
		categories.push({
			id: categoryId,
			name: category
		})
	}

	console.log('Crawled categories of length ', ids.length)

	// Close browser to clear memory
	await browser.close();

	console.log('Looping through the ids collected')
	for (let x = 0; x < ids.length; x++) {
		const categoryId = ids[x];

		console.log('Dealing with id: ', categoryId)

		const productUrl = `https://www.waitrose.com/api/graphql-prod/graph/live`

		// Assume page size until we have result
		let pageSize = 30
		let pageNum = 1
		let hasMorePages = true

		while (hasMorePages) {
			try {
				console.log('Querying products from ', categoryId)
				const axiosResponse = await axios.post(productUrl, {
						query: "fragment ProductFragment on Product {\n  availableDays\n  barCodes\n  conflicts {\n    messages\n    outOfStock\n    priority\n    productId\n    prohibitedActions\n    resolutionActions\n  }\n  containsAlcohol\n  lineNumber\n  images {\n    extraLarge\n    large\n    medium\n    small\n  }\n  id\n  productType\n  size\n  brand\n  thumbnail\n  name\n  leadTime\n  reviews {\n    averageRating\n    total\n  }\n  customerProductDetails {\n    customerFavourite\n    customerPyo\n  }\n  currentSaleUnitPrice {\n    quantity {\n      amount\n      uom\n    }\n    price {\n      amount\n      currencyCode\n    }\n  }\n  defaultQuantity {\n    amount\n    uom\n  }\n  depositCharge {\n    amount\n    currencyCode\n  }\n  pricing {\n    displayPrice\n    displayUOMPrice\n    displayPriceQualifier\n    displayPriceEstimated\n    currentSaleUnitRetailPrice {\n      price {\n        amount\n        currencyCode\n      }\n      quantity {\n        amount\n        uom\n      }\n    }\n    promotions {\n      promotionDescription\n      promotionExpiryDate\n      promotionId\n      pyoPromotion\n      myWaitrosePromotion\n      wasDisplayPrice\n      promotionType\n    }\n  }\n  persistDefault\n  markedForDelete\n  substitutionsProhibited\n  displayPrice\n  displayPriceEstimated\n  displayPriceQualifier\n  leadTime\n  productShelfLife\n  maxPersonalisedMessageLength\n  summary\n  supplierOrder\n  restriction {\n    availableDates {\n      restrictionId\n      startDate\n      endDate\n      cutOffDate\n    }\n  }\n  weights {\n    pricePerUomQualifier\n    defaultQuantity {\n      amount\n      uom\n    }\n    servings {\n      min\n      max\n    }\n    sizeDescription\n    uoms\n  }\n  categories {\n    id\n    name\n    urlName\n  }\n  productTags {\n    name\n  }\n  marketingBadges {\n    name\n  }\n}\nfragment ProductPod on Product {\n              brand,\n              categories {\n                  name,\n                  urlName,\n                  id\n              },\n              cqResponsive {\n                deviceBreakpoints {\n                  name\n                  visible\n                  width\n                }\n              },\n              currentSaleUnitPrice {\n                price {\n                  amount\n                  currencyCode\n                }\n                quantity {\n                  amount\n                  uom\n                }\n              },\n              customerProductDetails {\n                customerInTrolleyQuantity {\n                  amount\n                  uom\n                }\n                customerPyo\n              },\n              defaultQuantity {\n                  uom\n              },\n              depositCharge {\n                amount,\n                currencyCode\n              },\n              displayPrice,\n              displayPriceEstimated,\n              displayPriceQualifier,\n              id,\n              leadTime,\n              lineNumber\n              maxPersonalisedMessageLength,\n              name,\n              markedForDelete,\n              persistDefault,\n              productImageUrls {\n                  extraLarge,\n                  large,\n                  medium,\n                  small\n              }\n              productType,\n              promotion {\n                myWaitrosePromotion\n                promotionDescription\n                promotionId\n                promotionTypeCode\n                wasDisplayPrice\n              },\n              promotions {\n                myWaitrosePromotion\n                promotionDescription\n                promotionId\n                promotionTypeCode\n                wasDisplayPrice\n              },\n              restriction {\n                  availableDates {\n                      restrictionId,\n                      startDate,\n                      endDate,\n                      cutOffDate\n                  },\n              },\n              resultType,\n              reviews {\n                averageRating\n                reviewCount\n              },\n              size,\n              sponsored,\n              substitutionsProhibited,\n              thumbnail\n              typicalWeight {\n                amount\n                uom\n              }\n              weights {\n                  uoms ,\n                  pricePerUomQualifier,\n                  perUomQualifier,\n                  defaultQuantity {\n                      amount,\n                      uom\n                  },\n                  servings {\n                      max,\n                      min\n                  },\n                  sizeDescription\n              },\n              productTags {\n                name\n              },\n              marketingBadges {\n                name\n              },\n            }query(\n  $customerId: String!\n  $withRecommendations: Boolean!\n  $size: Int\n  $start: Int\n  $category: String\n  $filterTags: [filterTag]\n  $recommendationsSize: Int\n  $recommendationsStart: Int\n  $sortBy: String\n  $trolleyId: String\n  $withFallback: Boolean\n) {\n  getProductListPage(\n    category: $category\n    customerId: $customerId\n    filterTags: $filterTags\n    recommendationsSize: $recommendationsSize\n    recommendationsStart: $recommendationsStart\n    size: $size\n    start: $start\n    sortBy: $sortBy\n    trolleyId: $trolleyId\n    withFallback: $withFallback\n  ) {\n  productGridData {\n      failures{\n          field\n          message\n          type\n      }\n      componentsAndProducts {\n        __typename\n        ... on GridProduct {\n          searchProduct {\n            ...ProductPod\n          }\n        }\n        ... on GridCmsComponent {\n          aemComponent\n        }\n      }\n      conflicts {\n        messages\n        outOfStock\n        priority\n        productId\n        prohibitedActions\n        resolutionActions\n    }\n      criteria {\n        alternative\n        sortBy\n        filters {\n          group\n          filters {\n            applied\n            filterTag {\n              count\n              group\n              id\n              text\n              value\n            }\n          }\n        }\n        searchTags {\n          group\n          text\n          value\n        }\n        suggestedSearchTags {\n          group\n          text\n          value\n        }\n      }\n      locations {\n        header\n        masthead\n      }\n      metaData {\n        description\n        title\n        keywords\n        turnOffIndexing\n        pageTitle\n      }\n      productsInResultset\n      relevancyWeightings\n      searchTime\n      showPageTitle\n      totalMatches\n      totalTime\n    }\n    recommendedProducts @include(if: $withRecommendations) {\n      failures{\n        field\n        message\n        type\n      }\n      fallbackRecommendations\n      products {\n        ...ProductFragment\n        metadata {\n          recToken\n          monetateId\n        }\n      }\n      totalResults\n    }\n  }\n}\n",
						variables: {
							"start": pageNum,
							"size": pageSize,
							"sortBy": "MOST_POPULAR",
							"trolleyId": "0",
							"recommendationsSize": 0,
							"withRecommendations": false,
							"withFallback": true,
							"category": categoryId,
							"customerId": "-1",
							"filterTags": []
						}
					},
					{
						headers: {
							'Content-Type': 'application/json',
							'Authorization': 'Bearer unauthenticated'
						}
					}
				)

				const responseData = axiosResponse.data

				console.log('Products in set = ', responseData.data.getProductListPage.productGridData.productsInResultset)

				const foundProducts = responseData.data.getProductListPage.productGridData.productsInResultset

				// No product found, move to the next category?
				if (foundProducts === 0) {
					hasMorePages = false

					// Mark as crawled here since we must have surely visited the url
					crawledCategory++
				}

				const GridProducts = responseData.data.getProductListPage.productGridData.componentsAndProducts

				for (let i = 0; i < GridProducts.length; i++) {

					const product = GridProducts[i].searchProduct;

					const unitPrice = product.displayPriceQualifier?.indexOf('/') > -1 ? product.displayPriceQualifier?.split('/') : product.displayPriceQualifier?.split(' ')

					products.push({
						title: product.name,
						//`bfybuy` as used here is only a placeholder to satisfy waitroses's url structure
						link: `https://www.waitrose.com/ecom/products/bfybuy/${product.id}`,
						images: product.productImageUrls,
						price: {
							"current": product.displayPrice || product.currentSaleUnitPrice.price.amount,
							"unit": {
								"price": `${unitPrice ? unitPrice[0] : ''}`,
								// Split a text like "£5/kg" into £5 and kg and retrieve the second item
								"per": `${unitPrice ? unitPrice[1] : ''}`
							},
						},
						size: product?.size,
						category: product?.categories,
						offer: product?.offer,
						reviews: {
							ratings: product.reviews?.averageRating,
							count: product.reviews?.reviewCount
						},
						// productMeta: product.packInfo
					})
				}

				const total = responseData.data.getProductListPage.productGridData.totalMatches

				console.log('Total products is ', total)

				pageNum += 30
				hasMorePages = pageNum <= total

				console.log(`Going to fetch next ${pageSize} from page ${pageNum} out of ${total}`)

				writeToFile('waitrose', products)
			} catch (error) {
				hasMorePages = false
				writeToFile('waitrose', products)
				console.log('Error ', error)
				sendNotification(`Crawling Waitrose ran into an error!! Crawled a total of ${products.length} products in the meantime. Please check the logs`)
			}
		}
	}

	writeToFile('waitrose', products)

	// Process should be done here
	sendNotification(`Crawling Waitrose is done!! Crawled a total of ${products.length} products successfully! Crawled ${crawledCategory} out of ${ids.length}`)

})();
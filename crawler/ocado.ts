import puppeteer from 'puppeteer';
import fs from 'fs'
import axios from 'axios'
import path from 'path';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');

  await page.goto('https://www.ocado.com', {
	timeout: 100000
  })

  const navLinks = await page.$$('.primaryBar-container a')

//   const navbarurls = []

  const ocadoProducts = []

  try {
	for (const link of navLinks) {
		// Get all category urls
		const url = await page.evaluate(link => link.href, link)

		// Visit each url
		const categoryPage = await browser.newPage();
		console.log(`Going to URL ${url}`)
		await categoryPage.goto(url, {
			timeout: 100000 //hundred thousand ms cos I can't afford for this to fail
		});

		// Find the INITIAL_STATE containing product SKUs
		const scripts = await categoryPage.$$('script');

		let matchingScript = null;

		for (const script of scripts) {
			const content = await categoryPage.evaluate(script => script.innerHTML, script);
			if (/window\.INITIAL_STATE\s*=\s*\{/.test(content)) {
				matchingScript = script;
				break;
			}
		}

		let cleanedContent

		if (matchingScript) {
			// Get the content of the matching script tag
			const content = await categoryPage.evaluate(script => script.innerHTML, matchingScript);

			// Clean the content into a proper JSON
			cleanedContent = content.replaceAll(';', '')
			cleanedContent = cleanedContent.replace('=', '')
			cleanedContent = cleanedContent.replaceAll('window.INITIAL_STATE ', '')

			const json = JSON.parse(cleanedContent)

			// Select the important keys inside the JSON
			const collection = json.catalogue.productsPagesByRoute
			const productKey = Object.keys(collection)[0]

			const sections = collection[productKey].mainFopCollection.sections
			// const totalProducts = collection[productKey].mainFopCollection.totalFops

			// Populate the SKUs found here
			const skus = []

			// Loop through each SKU and store them properly
			for (const key in sections) {
				if (Object.hasOwnProperty.call(sections, key)) {
					const section = sections[key];

					if (Array.isArray(section.fops)) {
						for (let i = 0; i < section.fops.length; i++) {
							const fop = section.fops[i];
							const sku = fop.sku

							skus.push(sku)
						}
					}
				}
			}

			// Chunk SKU into comma separated string of 11 SKUs to append to the API url
			console.log(`All SKUs on this page is ${skus.length}`)

			for (let x = 0; x < skus.length; x += 11) {
				const eleven = skus.slice(x, x+11)

				const qs = eleven.join(',')

				const url = `https://www.ocado.com/webshop/api/v1/products?skus=${qs}`

				axios.get(url)
				.then(response => {
					const data = response.data

					data.forEach(product => {
						ocadoProducts.push({
							title: product.name,
							link: `https://www.ocado.com/products/${product.sku}`,
							images: [],
							price: product.price,
							size: product?.catchWeight,
							category: product?.mainCategory,
							offer: product?.offer,
							reviews: {
								ratings: product.reviewStats?.averageRate,
								count: product.reviewStats?.count
							},
							productMeta: product.packInfo
						})
					})
				})
				.catch(error => {
					console.log('An error has occurred ', error)
					writeToFile('ocado', ocadoProducts)
				})
			}

			writeToFile('ocado', ocadoProducts)

		} else {
			console.log('No matching script tag found');
		}
	}
  } catch (error) {
	writeToFile('ocado', ocadoProducts)
  }

  await browser.close();
})();

function writeToFile(filename, content) {
	const directory = path.resolve('./data')

	fs.writeFile(`${directory}/${filename}.json`, JSON.stringify(content, this, "\t"), { flag: 'w' }, err => {
		if (err) {
			console.error('Failed to write to file', err);
			return
		}
	})
}
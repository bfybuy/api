import puppeteer from 'puppeteer'
// import querystring from 'querystring'
import qs from 'qs'

const GeneratorImage = {
	async table(postData) {
		const browser = await puppeteer.launch({
			headless: false
		});

		const page = await browser.newPage();

		await page.setViewport({
			width: 500,
			height: 844,
			isMobile: true
		})

		await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');

		await page.setRequestInterception(true);

		page.once('request', async (request) => {
			var data = {
				'method': 'POST',
				'postData': qs.stringify(postData),
				'headers': {
					...request.headers(),
					'Content-Type': 'application/x-www-form-urlencoded'
				},
			};

			request.continue(data);

			// Immediately disable setRequestInterception, or all other requests will hang
			await page.setRequestInterception(false);
		});

		await Promise.all([
			await page.goto(process.env.BASE_URL + '/v1/template/telegram'),
			await page.screenshot({ path: './public/table.jpeg' }),
			await page.close()
		])

		console.log('Finished generating picture')

		return process.env.SSL_APP_URL + '/public/table.jpeg';
	}
}

export default GeneratorImage

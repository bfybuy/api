import puppeteer from 'puppeteer'
// import querystring from 'querystring'
import qs from 'qs'

const GeneratorImage = {
	async table(postData) {
		const browser = await puppeteer.launch({
			headless: false,
			slowMo: 500
			// args: ['--proxy-server=google.com']
		});

		const page = await browser.newPage();

		await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');

		await page.setRequestInterception(true);

		page.once('request', request => {
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
			page.setRequestInterception(false);
		});


		await page.goto(process.env.BASE_URL + '/v1/template/telegram')

		await page.screenshot({ path: './templates/table.jpeg' })

		// await page.close()
	}
}

export default GeneratorImage

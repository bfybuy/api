const axios = require('axios')
import fetch from 'node-fetch'

function search() {
	const data = {
		QueryString: `?&page=2`,
		CategoryId: `L1SpeciallySelected`
	}

	const headers = {
		'Accept-Language': 'en-GB',
		'X-Requested-With': 'XMLHttpRequest',
		'Content-Type': 'application/json',
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
		'Websiteid': 'f3dbd28d-365f-4d3e-91c3-7b730b39b294',
		'Referer': 'https://groceries.aldi.co.uk/en-GB/specially-selected?&page=2',
		'Sec-Ch-Ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
		'Origin': 'https://groceries.aldi.co.uk'
	}

	axios.post('https://groceries.aldi.co.uk/api/aldisearch/search', data, { headers })
	.then(res => console.log(res.data))
	.catch(err => console.error(err))
}

function search2()
{
    fetch('https://groceries.aldi.co.uk/api/aldisearch/search', {
		  method: 'POST',
		  headers: {
			'Accept-Language': 'en-GB',
			'X-Requested-With': 'XMLHttpRequest',
			'Content-Type': 'application/json',
			'User-Agent': 'BFYBUY',
            'Websiteid': 'f3dbd28d-365f-4d3e-91c3-7b730b39b294',
		  },
		  body: JSON.stringify({
              QueryString: `?&page=2`,
        		CategoryId: `L1SpeciallySelected`
          }),
		  redirect: 'follow'
		})
    .then(res => res.text())
}

search2()
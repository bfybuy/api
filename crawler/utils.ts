import fs from 'fs'
import path from 'path';
import AWS from 'aws-sdk'

export function writeToFile(filename, content) {
	const directory = path.resolve('./data')

	fs.writeFile(`${directory}/${filename}.json`, JSON.stringify(content, this, "\t"), { flag: 'w' }, err => {
		if (err) {
			console.error('Failed to write to file', err);
			return
		}
	})
}

export function sendNotification(msg = 'Crawling is finished') {
	AWS.config.update({
		accessKeyId: process.env.AWS_KEY_ID,
		secretAccessKey: process.env.AWS_ACCESS_ID,
		region: 'us-west-2'
	})

	// Create publish parameters
	var params = {
		Message: msg, /* required */
		TopicArn: 'arn:aws:sns:us-west-2:327676338247:CrawlerNotification'
	};

	// Create promise and SNS service object
	var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

	// Handle promise's fulfilled/rejected states
	publishTextPromise.then((data) => {
			console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
			console.log("MessageID is " + data.MessageId);
	}).catch((err) => {
			console.error(err, err.stack);
	});
}

// @ts-ignore
async function productCount() {
	const fileToRead = path.resolve('./data/waitrose.json')

	let products = fs.readFileSync(fileToRead, { encoding: 'utf-8' })

	products = JSON.parse(products)

	console.log('Products in waitrose are ', products.length)
	console.log('One product is ', products[0])

	return products.length
}
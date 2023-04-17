import { FastifyReply } from 'fastify';
import fp from 'fastify-plugin'
import TelegramBot from 'node-telegram-bot-api';
import { Product } from '../product/product.model';
import { table } from 'table';
import { User } from '../user/user.model';

/**
 * Perform a DB lookup with grocery items
 * passed.
 * @param msg \n Delimited string
 * @returns Array
 */
async function performDBLookup(msg: string) {
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
		}, 'name price size picture source', {
			skip: 0,
			limit: 4, //TODO: We may return everything since we will have an algorithm to filter
		})
		.exec()

		results.push({ search: listItem, matches: product })
	}

	return results
}

/**
 * 1. Don't return duplicates
 * 2. Only return 50% matches
 * 3. Return the cheapest based on price
 *
 * @param data
 */
async function searchAlgorithm (data: { matches: any[]; search: string | number; }[]) {
	/**
	 * Return array should be similar to:
	 * [
	 * 	{
	 * 		source: 'Aldi',
	 * 		item: 'Wholemeal Bread',
	 * 		price_per_unit: '£0.92',
	 * 		unit: 100g
	 * 	}
	 * ]
	 */
	const response = []

	data.map((datum: { matches: any[]; search: string | number; }) => {
		datum.matches.sort((a: { price: string; }, b: { price: string; }) => {

			// Some products may not have a price (tough!) - so we have to push them to the end
			if(!a.price) {
				console.log(a, " doesn't have a price")
				return -1
			}

			if (a?.price?.includes('£')) {
				a.price = a.price?.slice(1)
				b.price = b.price?.slice(1)
			}

			// Sort a after b if a has a higher price than b
			return parseFloat(a.price) > parseFloat(b.price) ? 1 : -1
		})

		response[datum.search] = datum.matches[0] //Store only the first match in our response
	})

	return response
}

async function storeUser(msg) {
	// Store user data if not exist
	// @ts-ignore
	const user = new User({
		firstname: msg.from.first_name,
		lastname: msg.from.last_name,
		agent: 'Telegram',
	})

	user.save()
}

async function Telegram(fastify, options, done) {
	const TOKEN = process.env.TG_TOKEN

	// No need to pass any parameters as we will handle the updates with Express
	const bot = new TelegramBot(TOKEN);

	// This informs the Telegram servers of the new webhook.
	bot.setWebHook(`${process.env.SSL_APP_URL}/bot${TOKEN}`);

	/**
	 * It is important that we send back a response with a
	 * 200 status code otherwise TG won't process our response.
	 *
	 * For longer tasks, use a queue!!
	 */
	fastify.post(`/bot${TOKEN}`, (req, reply: FastifyReply) => {
		console.log('TG payload to us is ', req.body)
		bot.processUpdate(req.body);
		reply.send({}).status(200)
	});

	// Just to ping!
	bot.on('message', async (msg) => {

		storeUser(msg)

		// Perform Search
		if(msg.text.includes('\n'))
		{
			const results = await performDBLookup(msg.text)

			await searchAlgorithm(results)

			bot.sendMessage(msg.chat.id, `Here are some results that match your item. Select specific ones by specifying their fully qualified names:`);
		}
		else
		{
			bot.sendMessage(msg.chat.id, `Sorry but I couldn't find a list in your message. Try again by typing your groceries like this: \n\nEggs\nSpinach\nTurkey\nMilk`)
		}
	});
}

export default fp(Telegram, { name: 'telegram-bot' })

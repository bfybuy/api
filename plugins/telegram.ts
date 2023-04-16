import { FastifyReply } from 'fastify';
import fp from 'fastify-plugin'
import TelegramBot from 'node-telegram-bot-api';
import { Product } from '../product/product.model';
import { table } from 'table';

async function groceryList(msg: string) {
	let results = []
	const list = msg.split('\n')

	for (let index = 0; index < list.length; index++) {
		const listItem = list[index];

		// @ts-ignore
		const product = await Product.find({
			$or: [
				{ name: new RegExp(listItem, 'i') },
				{ "meta.Ingredients": new RegExp(listItem, 'i') }
			]
		}, 'name price size picture source', {
			skip: 0,
			limit: 4,
		})
		.exec()

		results.push({ search: listItem, matches: product })
	}

	return results
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
		bot.processUpdate(req.body);
		reply.send({}).status(200)
	});

	// Just to ping!
	bot.on('message', async (msg) => {
		if(msg.text.includes('\n'))
		{
			const results = await groceryList(msg.text)
			let response
			let grid = []

			results.forEach(result => {
				if(grid.length === 0)
				{
					// grid.push(Object.keys(result.matches[0]))
					// manually set headers
					grid.push(
						[
							'Name',
							'Size',
							'Price'
						]
					)
				}

				result.matches.forEach(product => {
					grid.push([
						product?.name,
						product?.price,
						product?.size
					])
				})

				response = table(grid, {
					header: {
						content: result.search,
						alignment: 'center'
					}
				})

				bot.sendMessage(msg.chat.id, `Here are some results that match your item ${result.search}. Select specific ones by specifying their fully qualified names: \n\n${response.toString()}`);
			})

			console.log('Grid should lok like ', grid)
		}
		else
		{
			bot.sendMessage(msg.chat.id, `Sorry but I couldn't find a list in your message. Try again by typing your groceries like this: \n\nEggs\nSpinach\nTurkey\nMilk`)
		}
	});

	/**
	 * {
		update_id: 787513749,
			message: {
				message_id: 5,
				from: {
					id: 789154196,
					is_bot: false,
					first_name: 'Samuel',
					last_name: 'Olaegbe',
					username: 'samuelolaegbe',
					language_code: 'en'
				},
				chat: {
					id: 789154196,
					first_name: 'Samuel',
					last_name: 'Olaegbe',
					username: 'samuelolaegbe',
					type: 'private'
				},
				date: 1681595301,
				text: '/start',
				entities: [ [Object] ]
			}
		}
	 */
}

export default fp(Telegram, { name: 'telegram-bot' })

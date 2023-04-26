import { FastifyReply } from 'fastify';
import fp from 'fastify-plugin'
import TelegramBot from 'node-telegram-bot-api';
import CompareService from '../compare/compare.service'
import UserService from '../user/user.service';
import GeneratorImage from '../templates/generator';

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

		UserService.storeUser(msg)

		// Perform Search
		if(msg.text?.includes('\n'))
		{
			const results = await CompareService.performDBLookup(msg.text)
			const sortedResults = await CompareService.sortAlgorithm(results)

			const url = await GeneratorImage.table(sortedResults)

			console.log('Returned URL for file is ', url)

			bot.sendMessage(msg.chat.id, `We've found the best stores to purchase your grocery items from!!`);
			bot.sendPhoto(msg.chat.id, url);
		}
		else
		{
			bot.sendMessage(msg.chat.id, `Sorry but I couldn't find a list in your message. Try again by typing your groceries like this: \n\nEggs\nSpinach\nTurkey\nMilk`)
		}
	});
}

export default fp(Telegram, { name: 'telegram-bot' })

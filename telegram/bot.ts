import TeleBot from 'telebot'
import path from 'path'

const bot = new TeleBot({
    token: process.env.TG_TOKEN, // Required. Telegram Bot API token.
    webhook: { // Optional. Use webhook instead of polling.
        key: path.resolve('./keys/localhost.key'), // Optional. Private key for server.
        cert: path.resolve('./keys/localhost.crt'), // Optional. Public key.
        url: process.env.TG_SSL_URL, // HTTPS url to send updates to.
        host: '0.0.0.0', // Webhook server host.
        port: process.env.APP_PORT, // Server port.
    },
})

bot.on('sticker', (msg) => {
    return msg.reply.sticker('http://i.imgur.com/VRYdhuD.png', { asReply: true });
})

bot.on('text', (msg) => msg.reply.text(msg.text));

bot.on(['/start', '/hello'], (msg) => msg.reply.text('Welcome!'));

bot.start()
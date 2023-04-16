import Fastify, { FastifyBaseLogger, FastifyHttp2SecureOptions, FastifyInstance, FastifyTypeProviderDefault } from 'fastify'
import mongodb from './plugins/database'
import rateLimitConfig from './config/rate-limit'
import config from './plugins/config'
import fastifyRateLimit from '@fastify/rate-limit'
import Telegram from './plugins/telegram'
import { apiRoutes } from './api'
import { Http2SecureServer } from 'http2'

async function app(options: FastifyHttp2SecureOptions<Http2SecureServer, FastifyBaseLogger>) {
	const fastify = Fastify(options)

	await fastify.register(config, { namespace: 'PARLINE_PRIVATE', ...options })
	await fastify.register(fastifyRateLimit, rateLimitConfig)

	fastify.register(mongodb)
	fastify.register(Telegram)
	fastify.register(apiRoutes, { prefix: '/v1' })

	return fastify
}

export default app

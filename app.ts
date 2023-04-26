import Fastify, { FastifyBaseLogger, FastifyHttp2SecureOptions } from 'fastify'
import mongodb from './plugins/database'
import rateLimitConfig from './config/rate-limit'
import config from './plugins/config'
import fastifyRateLimit from '@fastify/rate-limit'
import Telegram from './plugins/telegram'
import { apiRoutes } from './api'
import { Http2SecureServer } from 'http2'
import viewsConfig from './config/view'
import path from 'path'
import fastifyStatic from '@fastify/static'

async function app(options: FastifyHttp2SecureOptions<Http2SecureServer, FastifyBaseLogger>) {
	const fastify = Fastify(options)

	await fastify.register(config, { namespace: 'PARLINE_PRIVATE', ...options })
	await fastify.register(fastifyRateLimit, rateLimitConfig)

	fastify.register(mongodb)
	fastify.register(Telegram)
	fastify.register(require('@fastify/formbody'))
	fastify.register(require('@fastify/view'), viewsConfig)
	fastify.register(apiRoutes, { prefix: '/v1' })

	fastify.register(fastifyStatic, {
		root: path.resolve('public'),
		prefix: '/public/', // optional: default '/'
		cacheControl: false,
		// constraints: { host: 'example.com' } // maybe we allow only api.telegram.com
	})

	return fastify
}

export default app

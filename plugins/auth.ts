import fp from 'fastify-plugin'
import bearerAuthPlugin from '@fastify/bearer-auth'

export default fp(async function (fastify, opts) {
	const keys = new Set([process.env.ADMIN_API_KEY]);

	fastify.register(bearerAuthPlugin, {keys})
})

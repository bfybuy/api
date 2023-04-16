import fp from 'fastify-plugin'
import * as dotenv from 'dotenv'

dotenv.config()

async function Config(fastify, options, done) {
	const namespace = null //options.namespace || null
	const configuration = {}

	Object.keys(process.env).forEach((key) => {
		if (namespace && key.startsWith(namespace)) {
			if (options && options[key]) {
				// Override any config with the Fastify option
				configuration[key] = options[key]
			}
		}
	})

	if (!fastify.configuration) {
		fastify.decorate('configuration', configuration)
	}

	done()
}

export default fp(Config, { name: 'configuration' })

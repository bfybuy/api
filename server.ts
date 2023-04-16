import app from './app'

const start = async () => {
	// @ts-ignore
	const server = await app({
		pluginTimeout: 15000,
		logger: {
			level: 'info',
			transport: {
				target: 'pino-pretty',
			},
		}
	})

	try {
		await server.listen({
			// @ts-ignore
			port: parseInt(process.env.APP_PORT),
		})
	} catch (err) {
		server.log.error(err)
		process.exit(1)
	}
}

start()

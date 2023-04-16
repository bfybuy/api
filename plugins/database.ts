import fp from 'fastify-plugin'
import mongoose from 'mongoose'

async function Mongodb(fastify, options, done) {
	try {
		const mongodb = await mongoose.connect(
			process.env.DB_URL
		)
		if (!fastify.mongodb) {
			fastify.decorate('mongodb', mongodb)
		}

		fastify.addHook('onClose', async (fastify, done) => {
			mongoose.disconnect().then(done).catch(done)
			fastify.log.info('Database connection closed')
		})

		fastify.log.info('Successfully connected to database')
	} catch (err) {
		fastify.log.error(err)
	} finally {
		done()
	}
}

export default fp(Mongodb, { name: 'bfybuy-mongodb' })

import { FastifyInstance } from 'fastify'
import qs from 'qs'

const templateRoutes = async (fastify: FastifyInstance, _options: any) => {
	fastify.post('/telegram', (req, reply) => {
		// console.log('puppeteer post data body => ', req.body, ' parsed => ', qs.parse(req.body))
		// @ts-ignore
		reply.view('/templates/table.ejs', { data: qs.parse(req.body) })
	})
}

export default templateRoutes
import { FastifyInstance } from 'fastify'
import qs from 'qs'

const templateRoutes = async (fastify: FastifyInstance, _options: any) => {
	fastify.post('/telegram', (req, reply) => {
		// console.log('puppeteer post data body => ', req.body, ' parsed => ', qs.parse(req.body))
		// const data = [
		// 	[ 'Item', 'Aldi', 'Ocado' ],
		// 	[
		// 		'Milk',
		// 		'100g/3£',
		// 		'100g/15£' ],
		// 	[ 'Turkey', '100g/3£', '100g/15£' ],
		// 	[ 'Bread', '100g/3£', '100g/15£' ],
		// 	[ 'Spinach', '100g/3£', '100g/15£' ],
		// 	[ { text: 'items'}, { cheapest: true, text: '5' }, { cheapest: false, text: '3'} ],
		// ]
		// @ts-ignore
		reply.view('/templates/table.ejs', { data: qs.parse(req.body) })
	})
}

export default templateRoutes
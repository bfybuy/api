import { FastifyInstance } from 'fastify'
import CompareController from './compare.controller'

const compareRoutes = async (fastify: FastifyInstance, _options: any) => {
	fastify.post('/import', CompareController.create)
}

export default compareRoutes
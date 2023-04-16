import scriptRoutes from './scripts/script.route'
export const apiRoutes = async (fastify, options) => {
	/**
	 * Register entity routes within the plugin
	 */
	fastify.register(scriptRoutes, { prefix: '/scripts' })
	fastify.register(scriptRoutes, { prefix: '/compare' })
}

import scriptRoutes from './scripts/script.route'
import templateRoutes from './templates/template.route'

export const apiRoutes = async (fastify, options: any) => {
	/**
	 * Register entity routes within the plugin
	 */
	fastify.register(scriptRoutes, { prefix: '/scripts' })
	fastify.register(scriptRoutes, { prefix: '/compare' })
	fastify.register(templateRoutes, { prefix: '/template', data: {text: "text"} })
}

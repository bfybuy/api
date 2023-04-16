import { RateLimitPluginOptions } from '@fastify/rate-limit'
// Options docs available at https://github.com/fastify/fastify-rate-limit#options
const rateLimitConfig: RateLimitPluginOptions = {
	global: true,
	ban: 2,
	nameSpace: 'ipu-rate-limit-',
	onExceeding: () => {},
	onExceeded: () => {},
	onBanReach: () => {},
	allowList: process.env.RATE_LIMIT_ALLOW_LIST?.split(','),
	// @ts-ignore
	max: parseInt(process.env.RATE_LIMIT_MAX_CALLS),
	timeWindow: process.env.RATE_LIMIT_TIME_WINDOW,
}

export default rateLimitConfig

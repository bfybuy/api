import { User } from '../user/user.model'

const UserService = {
	/**
	 * Creates a new user based on the payload from Telegram
	 * TODO: Figure the best place to put this sort of code
	 * @param msg
	 */
	storeUser(msg) {
		// Store user data if not exist

		// @ts-ignore
		const existing = User.find({
			email: msg.from.email,
			firstname: msg.from.first_name,
			lastname: msg.from.last_name
		})

		if (!existing || existing.length === 0) {
			console.log('User does not exist ')
			// @ts-ignore
			const user = new User({
				firstname: msg.from.first_name,
				lastname: msg.from.last_name,
				agent: 'Telegram',
				email: msg?.from?.email
			})

			user.save()
		}
	}
}

export default UserService
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
	firstname: String,
	lastname: String,
	email: {
		unique: true,
		type: String
	},
	phone: {
		type: String,
		unique: true
	},
	agent: {
		type: String,
		enum: ['Web', 'Telegram', 'WhatsApp']
	}
})

export default UserSchema
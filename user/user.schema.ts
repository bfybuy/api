import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
	firstname: String,
	lastname: String,
	email: String,
	phone: String,
	agent: {
		type: String,
		enum: ['Web', 'Telegram', 'WhatsApp']
	}
})

export default UserSchema
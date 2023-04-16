import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
	name: String,
	description: String,
	picture: String
})

export default CategorySchema
import mongoose from "mongoose"

const ProductSchema = new mongoose.Schema({
	name: String,
	description: String,
	price: Object,
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Categories'
	},
	picture: [String],
	url: String,
	source: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Sources'
	},
	size: String,
	meta: Array
},
{
	timestamps: true
})

export default ProductSchema
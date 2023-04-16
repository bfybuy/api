import mongoose from "mongoose";

const SourceSchema = new mongoose.Schema({
	name: String,
	website: String,
	description: String,
	last_crawled: Date
})

export default SourceSchema
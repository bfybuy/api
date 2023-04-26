import mongoose from "mongoose";
declare const CategorySchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    name?: string;
    description?: string;
    picture?: string;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    name?: string;
    description?: string;
    picture?: string;
}>> & Omit<mongoose.FlatRecord<{
    name?: string;
    description?: string;
    picture?: string;
}> & {
    _id: mongoose.Types.ObjectId;
}, never>>;
export default CategorySchema;

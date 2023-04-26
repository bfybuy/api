import mongoose from "mongoose";
declare const ProductSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    picture: string[];
    meta: any[];
    name?: string;
    description?: string;
    size?: string;
    source?: mongoose.Types.ObjectId;
    price?: string;
    url?: string;
    category?: mongoose.Types.ObjectId;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    picture: string[];
    meta: any[];
    name?: string;
    description?: string;
    size?: string;
    source?: mongoose.Types.ObjectId;
    price?: string;
    url?: string;
    category?: mongoose.Types.ObjectId;
}>> & Omit<mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    picture: string[];
    meta: any[];
    name?: string;
    description?: string;
    size?: string;
    source?: mongoose.Types.ObjectId;
    price?: string;
    url?: string;
    category?: mongoose.Types.ObjectId;
}> & {
    _id: mongoose.Types.ObjectId;
}, never>>;
export default ProductSchema;

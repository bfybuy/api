import mongoose from "mongoose";
declare const SourceSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    name?: string;
    description?: string;
    website?: string;
    last_crawled?: Date;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    name?: string;
    description?: string;
    website?: string;
    last_crawled?: Date;
}>> & Omit<mongoose.FlatRecord<{
    name?: string;
    description?: string;
    website?: string;
    last_crawled?: Date;
}> & {
    _id: mongoose.Types.ObjectId;
}, never>>;
export default SourceSchema;

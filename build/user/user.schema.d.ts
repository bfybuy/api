import mongoose from "mongoose";
declare const UserSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    agent?: "Web" | "Telegram" | "WhatsApp";
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    agent?: "Web" | "Telegram" | "WhatsApp";
}>> & Omit<mongoose.FlatRecord<{
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    agent?: "Web" | "Telegram" | "WhatsApp";
}> & {
    _id: mongoose.Types.ObjectId;
}, never>>;
export default UserSchema;

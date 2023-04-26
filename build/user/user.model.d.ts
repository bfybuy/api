/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import UserSchema from "./user.schema";
import { InferSchemaType } from "mongoose";
declare type IUser = InferSchemaType<typeof UserSchema>;
declare const User: import("mongoose").Model<any, {}, {}, {}, any, any> | import("mongoose").Model<{
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    agent?: "Web" | "Telegram" | "WhatsApp";
}, {}, {}, {}, import("mongoose").Document<unknown, {}, {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    agent?: "Web" | "Telegram" | "WhatsApp";
}> & Omit<{
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    agent?: "Web" | "Telegram" | "WhatsApp";
} & {
    _id: import("mongoose").Types.ObjectId;
}, never>, any>;
export { User };
export type { IUser };

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
import ProductSchema from "./product.schema";
import { InferSchemaType } from "mongoose";
declare type IProduct = InferSchemaType<typeof ProductSchema>;
declare const Product: import("mongoose").Model<any, {}, {}, {}, any, any> | import("mongoose").Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    picture: string[];
    meta: any[];
    name?: string;
    description?: string;
    size?: string;
    source?: import("mongoose").Types.ObjectId;
    price?: string;
    url?: string;
    category?: import("mongoose").Types.ObjectId;
}, {}, {}, {}, import("mongoose").Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    picture: string[];
    meta: any[];
    name?: string;
    description?: string;
    size?: string;
    source?: import("mongoose").Types.ObjectId;
    price?: string;
    url?: string;
    category?: import("mongoose").Types.ObjectId;
}> & Omit<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    picture: string[];
    meta: any[];
    name?: string;
    description?: string;
    size?: string;
    source?: import("mongoose").Types.ObjectId;
    price?: string;
    url?: string;
    category?: import("mongoose").Types.ObjectId;
} & {
    _id: import("mongoose").Types.ObjectId;
}, never>, any>;
export { Product };
export type { IProduct };

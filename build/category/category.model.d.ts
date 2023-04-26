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
import CategorySchema from "./category.schema";
import { InferSchemaType } from "mongoose";
declare type ICategory = InferSchemaType<typeof CategorySchema>;
declare const Category: import("mongoose").Model<any, {}, {}, {}, any, any> | import("mongoose").Model<{
    name?: string;
    description?: string;
    picture?: string;
}, {}, {}, {}, import("mongoose").Document<unknown, {}, {
    name?: string;
    description?: string;
    picture?: string;
}> & Omit<{
    name?: string;
    description?: string;
    picture?: string;
} & {
    _id: import("mongoose").Types.ObjectId;
}, never>, any>;
export { Category };
export type { ICategory };

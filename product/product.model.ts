import ProductSchema from "./product.schema"
import { models, model, InferSchemaType } from "mongoose"

type IProduct = InferSchemaType<typeof ProductSchema>

const Product = models.Products || model<IProduct>('Products', ProductSchema)

export { Product }
export type { IProduct }

import CategorySchema from "./category.schema"
import { models, model, InferSchemaType } from "mongoose"

type ICategory = InferSchemaType<typeof CategorySchema>

const Category = models.Categories || model<ICategory>('Categories', CategorySchema)

export { Category }
export type { ICategory }

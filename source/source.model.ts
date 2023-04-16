import SourceSchema from "./source.schema"
import { models, model, InferSchemaType } from "mongoose"

type ISource = InferSchemaType<typeof SourceSchema>

const Source = models.Sources || model<ISource>('Sources', SourceSchema)

export { Source }
export type { ISource }

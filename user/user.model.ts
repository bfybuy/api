import UserSchema from "./user.schema"
import { models, model, InferSchemaType } from "mongoose"

type IUser = InferSchemaType<typeof UserSchema>

const User = models.Users || model<IUser>('Users', UserSchema)

export { User }
export type { IUser }

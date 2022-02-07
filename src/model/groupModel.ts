// import mongoose, { Schema, model, Document, Types } from 'mongoose'
// // import { GroupInput } from '../utils/interface'

// //Build a Group Schema
// const GroupSchema = new Schema(
//   {
//     group_name: String,
//     group_image: String,
//     group_desc: String,
//     group_members: [String], //email address of users
//     group_link: String,
//     isAdmin: [{ type: Schema.Types.ObjectId, ref: 'User' }],
//   },
//   {
//     timestamps: true,
//   }
// )

// export let Group = model<any>('Group', GroupSchema)

import mongoose, { Schema, model, Document, Types } from 'mongoose'
// import { UserSchema } from '../model/userModel'
import { GroupInput } from '../utils/interface'
//Build a Group Schema
const GroupSchema = new Schema<GroupInput>(
  {
    group_name: String,
    group_image: String,
    group_desc: String,
    group_members: {
      type: [String],
      validate: [arrayLimit, 'Group cannot exceeds the limit of 300'],
    },
    group_link: String,
    author: {
      name: String,
      email: String,
    }
  },
  {
    timestamps: true,
  }
)
GroupSchema.index({ group_name: "text" });
function arrayLimit(val: string[]): boolean {
  return val.length <= 300
}
export let ChatRoom = model<GroupInput>('ChatRoom', GroupSchema)

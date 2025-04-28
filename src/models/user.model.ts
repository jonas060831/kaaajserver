import mongoose from 'mongoose'

const { Schema, model } = mongoose

const userSchema = new Schema({
  username: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  role: { type: String, required: true, enum: ['Admin', 'Developer', 'Guest', 'Creator'] },
  personal: {
    firstName: {
      type: String,
      required: true,
      trim: true,
      set: (val: string) => {
        return val
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
      }
    },
    middleName: {
      type: String,
      trim: true,
      default: null,
      set: (val: string) => {
        return val
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
      }
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      set: (val: string) => {
        return val
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
      }
    }
  },
  accounts: [{ type: Schema.Types.ObjectId, ref: 'Account' }]

}, { timestamps: true });

//do not return hashedPassword
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    if (returnedObject.hashedPassword) {
      delete returnedObject.hashedPassword
    }
  }
})

const User = model('User', userSchema)

export default User

import mongoose from 'mongoose'

const { Schema, model } = mongoose

const userSchema = new Schema({
  username: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  role: { type: String, required: true, enum: ['Admin', 'Developer', 'Guest', 'Creator'] },
})

//do not return hashedPassword
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.hashedPassword
  }
})

const User = model('User', userSchema)

export default User

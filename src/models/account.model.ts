import mongoose from 'mongoose'
import crypto from 'crypto'  // Required for better randomness

const { Schema, model } = mongoose

interface IAccount {
  name: string;
  identifier: string;
  owner: mongoose.Types.ObjectId;
}

const accountSchema = new Schema<IAccount>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  identifier: {
    type: String,
    required: true,
    unique: true,
    default: () => {
      // Generate a more unique identifier using crypto.randomUUID() or crypto.randomBytes
      const sec1 = crypto.randomBytes(2).toString('hex').toUpperCase();  // 4 characters
      const sec2 = crypto.randomBytes(2).toString('hex').toUpperCase();  // 4 characters
      const sec3 = crypto.randomBytes(2).toString('hex').toUpperCase();  // 4 characters
      return `ACT-${sec1}-${sec2}-${sec3}`;
    }
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true })

const Account = model<IAccount>('Account', accountSchema)

export default Account

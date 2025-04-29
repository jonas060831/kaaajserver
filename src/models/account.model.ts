import mongoose from 'mongoose'
import crypto from 'crypto'
const { Document, Schema, model  } = mongoose

interface IAccount {
  name: string;
  identifier: string;
  owner: mongoose.Types.ObjectId
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
      const randomHex = crypto.randomBytes(6).toString('hex').toUpperCase();
      return `ACT-${randomHex.slice(0, 4)}-${randomHex.slice(4, 8)}-${randomHex.slice(8, 12)}`;
    }
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true })

const Account = model('Account', accountSchema)

export default Account

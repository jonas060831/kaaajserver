import mongoose from 'mongoose'
import crypto from 'crypto'
const { Document, Schema, model  } = mongoose


interface ILocation {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipcode: string;
}

interface IAccount {
  name: string;
  identifier: string;
  owner: mongoose.Types.ObjectId;
  live: boolean;
  location: ILocation
}


const locationSchema = new Schema<ILocation>({
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipcode: { type: String, required: true },
});

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
  },
  live: {
    type: Boolean,
    required: true,
    default: false
  },
  location: {
    type: locationSchema,
    required: true
  }
}, { timestamps: true })

const Account = model('Account', accountSchema)

export default Account

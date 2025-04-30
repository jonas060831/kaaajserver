import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Interface for account references inside User
interface IAccountRef {
  default: mongoose.Types.ObjectId | null;
  list: mongoose.Types.ObjectId[];
}

// Interface for User document
interface IUser extends mongoose.Document {
  username: string;
  hashedPassword: string;
  role: 'Admin' | 'Developer' | 'Guest' | 'Creator';
  personal: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
  accounts: IAccountRef;
}

// Function to format names properly
const formatName = (val: string) =>
  val
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  role: { type: String, required: true, enum: ['Admin', 'Developer', 'Guest', 'Creator'] },
  personal: {
    firstName: { type: String, required: true, trim: true, set: formatName },
    middleName: { type: String, trim: true, default: null, set: formatName },
    lastName: { type: String, required: true, trim: true, set: formatName }
  },
  accounts: {
    default: { type: Schema.Types.ObjectId, ref: 'Account', default: null },
    list: [{ type: Schema.Types.ObjectId, ref: 'Account', default: [] }] // ✅ Always initialize as empty array
  }
}, { timestamps: true });

// Ensure hashedPassword is not returned in JSON responses
userSchema.set('toJSON', {
  transform: (_, returnedObject) => {
    delete returnedObject.hashedPassword;
  }
});

// ✅ Ensure `accounts.default` is set automatically when an account is added
userSchema.pre('save', function (next) {
  if (!this.accounts) {
    this.accounts = { default: null, list: [] }; // ✅ Always initialize
  }
  if (!this.accounts.default && this.accounts.list.length > 0) {
    this.accounts.default = this.accounts.list[0];
  }
  next();
});

// Create the User model
const User = model<IUser>('User', userSchema);

export default User;

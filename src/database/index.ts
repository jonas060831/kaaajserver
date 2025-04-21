import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
mongoose.set('strictQuery', true);

const NODE_ENV = process.env.NODE_ENV;

export async function connectToDatabase(): Promise<void> {
  try {

    const connectionString = process.env.MONGODB_URI

    if(!connectionString) throw new Error('MONGODB_URI is not defined in environment variables')


    mongoose.connection.on('connected', () => {
      console.log(`✅ Connected to MongoDB ${mongoose.connection.name} in ${NODE_ENV} mode.`)
    })

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });


    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 5000,
    })



  } catch (error) {
    console.log('❌ Failed to connect to MongoDB:', error)
  }
}

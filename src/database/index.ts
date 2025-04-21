import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
mongoose.set('strictQuery', true);

const NODE_ENV = process.env.NODE_ENV;

export async function connectToDatabase(uri: string): Promise<void> {
  try {


    if(!uri) throw new Error('MONGODB_URI is not defined in environment variables')

    //Connect to database
    if(process.env.NODE_ENV !== 'test') {
      mongoose.connection.on('connected', () => {
        console.log(`✅ Connected to MongoDB ${mongoose.connection.name} in ${NODE_ENV} mode.`)
      })

      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });


      if(mongoose.connection.readyState === 0) await mongoose.connect(uri)
    }



  } catch (error) {
    console.log('❌ Failed to connect to MongoDB:', error)
  }
}

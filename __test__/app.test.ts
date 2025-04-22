import { app} from '../src'
import { connectToDatabase } from '../src/database'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongoServer: MongoMemoryServer

beforeAll(async () => {

  //start the in memory mongodb server
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri();

  try {
    await mongoose.connect(mongoUri);
    //console.info('Connected to MongoDB test databases');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
})


describe('GET /', () => {
  it('should return a Welcome Message', async () => {

    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('message', 'Welcome to KAAAJ API')
  })
})



afterAll(async () => {
  //Close MONGODB connection and stop server
  await mongoose.disconnect()
  await mongoServer.stop()
})

import { app } from '../src'
import { connectToDatabase } from '../src/database'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

import {userProps} from '../src/helpers/user'

let mongoServer: MongoMemoryServer

beforeAll(async () => {

  //start the in memory mongodb server
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri();

  try {
    await mongoose.connect(mongoUri);
    //console.log('Connected to MongoDB test databases');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
})

const newUser = {
  username: 'test@test.com',
  password: 'Test123!',
  role: 'Guest'
}

describe('POST /api/auth/signup', () => {
  it('should return a token', async () => {
    const response = await request(app)
    .post('/api/auth/signup')
    .send(newUser)
    expect(response.status).toBe(201)
    expect(newUser.username).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/); //valid email
    expect(newUser.password.length).toBeGreaterThanOrEqual(8) //atleast 8 characters
    expect(newUser.password).toMatch(/[A-Z]/) //atleast 1 capital letter
    expect(newUser.password).toMatch(/\d/); // At least one digit
    expect(newUser.password).toMatch(/[!@#$%^&*()_\+\-\/\\<>,.;'\[\]{}|]/); //atleast one of these special characters
    expect(response.body).toHaveProperty('token')
  }, 10000)
})



afterAll(async () => {
  //Close MONGODB connection and stop server
  await mongoose.disconnect()
  await mongoServer.stop()
})

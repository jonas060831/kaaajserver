import { app } from '../src'
import { connectToDatabase } from '../src/database'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

import { userProps} from '../src/helpers/user'

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

const madeUpUser = {
  username: 'nonexistent@test.com',
  password: 'ValidPass123!',
  role: 'Guest'
}

describe('POST Signup Route', () => {
  it('should return a token for a successful sign up', async () => {
    const response = await request(app)
    .post('/api/auth/signup')
    .send(newUser)
    expect(response.status).toBe(201)
    expect(newUser.username).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/); //valid email
    expect(newUser.password.length).toBeGreaterThanOrEqual(8) //atleast 8 characters
    expect(newUser.password).toMatch(/[A-Z]/) //atleast 1 capital letter
    expect(newUser.password).toMatch(/\d/) // At least one digit
    expect(newUser.password).toMatch(/[!@#$%^&*()_\+\-\/\\<>,.;'\[\]{}|]/) //atleast one of these special characters
    expect(response.body).toHaveProperty('token')
  }, 10000)
})


describe('POST Signin Route', () => {
  it('should return a token if credentials are valid', async () => {

    //sign up the user
    await request(app)
    .post('/api/auth/signup')
    .send(newUser)

    const response = await request(app)
    .post('/api/auth/signin')
    .send({
      username: newUser.username,
      password: newUser.password
    })
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('token')
    expect(typeof response.body.token).toBe('string')
    }, 10000)

  it('should return 401 if user does not exist', async () => {
    const response = await request(app)
    .post('/api/auth/signin')
    .send(madeUpUser)
    expect(response.status).toBe(401)
    expect(response.body).not.toHaveProperty('token')
  }, 10000)

  it('should return 401 if password is incorrect', async () => {
    //register
    await request(app)
    .post('/api/auth/signup')
    .send(newUser)

    //test a wrong password
    const response: any = await request(app)
    .post('/api/auth/signin')
    .send({
      username: newUser.username,
      password: 'WrongPassword123!'
    })
    expect(response.status).toBe(401)
    expect(response.body).not.toHaveProperty('token')
  }, 10000)
})

afterAll(async () => {
  //Close MONGODB connection and stop server
  await mongoose.disconnect()
  await mongoServer.stop()
})

import { app, server } from '../src'
import request from 'supertest'


describe('GET /', () => {
  it('should return a JSON response', async () => {

    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('message', 'Welcome to KAAAJ API')
  })
})


afterAll(done => {
  server.close()
  done()
})

require('./firebase-init.js');
const request = require('supertest');
const express = require('express');
const router = require('../routes/authRoutes');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());
app.use('/', router);

describe('Auth Routes', () => {
  it('should return 400 for registration with missing fields', async () => {
    const res = await request(app)
        .post('/register')
        .send({});
    expect(res.statusCode).toEqual(400);
  });

  it('should create a new user', async () => {
    const res = await request(app)
        .post('/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });
    expect(res.statusCode).toEqual(201);
  });

  it('should login a user', async () => {
    await request(app)
        .post('/register')
        .send({
          email: 'login@example.com',
          password: 'password123',
          name: 'Login User',
        });

    const res = await request(app)
        .post('/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });
    expect(res.statusCode).toEqual(200);
  });

  it('should not login a user with wrong password', async () => {
    await request(app)
        .post('/register')
        .send({
          email: 'wrongpassword@example.com',
          password: 'password123',
          name: 'Wrong Password User',
        });

    const res = await request(app)
        .post('/login')
        .send({
          email: 'wrongpassword@example.com',
          password: 'wrongpassword',
        });
    expect(res.statusCode).toEqual(401);
  });
});

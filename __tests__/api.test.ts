import request from 'supertest';

const baseURL = 'http://localhost:3000';

describe('Customer API', () => {
  it('should signup a new customer', async () => {
    const res = await request(baseURL)
      .post('/api/customers/signup')
      .send({
        name: 'Test User',
        phoneNo: '1234567890',
        emailId: 'testuser@example.com',
        password: 'secret123',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('custId');
  });

  it('should login with valid credentials', async () => {
    const res = await request(baseURL)
      .post('/api/customers/login')
      .send({
        emailId: 'testuser@example.com',
        password: 'secret123',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Login successful');
  });
});

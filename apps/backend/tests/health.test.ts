import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index';

describe('API', () => {
  it('should return 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });
});

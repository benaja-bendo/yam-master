import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index'; // exporte app séparément

describe('API', () => {
  it('should return 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});

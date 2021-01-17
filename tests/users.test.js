import 'chai/register-should.js';
import request from 'supertest';

import { nanoid } from 'nanoid';
import createServer from '../app.js';
import db from '../db/db.js';

import { getAll } from '../db/user.js';

const app = createServer();

const api = await request(app);

describe('Users API', () => {
  describe('GET /users', () => {
    it('returns an empty list of when no users in the DB', async () => {
      const users = await getAll();

      users.should.be.a.instanceOf(Array);
      users.length.should.equal(0);
    });
  });
});

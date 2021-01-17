import 'chai/register-should.js';
import request from 'supertest';

import { nanoid } from 'nanoid';
import createServer from '../app.js';

import { removeSeedData, seedData } from './helpers/user.js';
import { findById } from '../db/cart.js';

const app = createServer();
const api = request(app);

const user = {
  id: nanoid(),
  username: 'test1',
  password: 'password1',
  address_id: 'testtesttesttesttestt',
  fullname: 'Test McTesty',
};

describe('Carts API', async () => {
  beforeEach(async () => {});
  beforeEach(async () => {
    await removeSeedData();
  });
  describe('POST /carts', async () => {
    it('creates a new cart and returns id', async () => {
      await seedData(user);
      const { status, body } = await api
        .post('/api/carts')
        .send({ id: user.id });

      status.should.equal(201);
      body.cart_id.length.should.equal(21);

      const cart = await findById(body.cart_id);
      cart.user_id.should.equal(user.id);
    });
  });
});

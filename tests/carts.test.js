import 'chai/register-should.js';
import request from 'supertest';

import { nanoid } from 'nanoid';
import createServer from '../app.js';

import { seedData } from './helpers/user.js';
import { removeSeedData } from './helpers/cart.js';
import { findById, getAll } from '../db/cart.js';

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
  beforeEach(async () => {
    await seedData(user);
  });
  afterEach(async () => {
    await removeSeedData();
  });
  describe('POST /carts', async () => {
    it('creates a new cart and returns id', async () => {
      const { status, body } = await api
        .post('/api/carts')
        .send({ id: user.id });

      status.should.equal(201);
      body.cart_id.length.should.equal(21);

      const cart = await findById(body.cart_id);
      cart.user_id.should.equal(user.id);
    });
    it('doesnt create a cart if one already exists', async () => {
      const first = await api.post('/api/carts').send({ id: user.id });
      first.status.should.equal(201);

      const second = await api.post('/api/carts').send({ id: user.id });

      const carts = await getAll();
      second.status.should.equal(400);
      carts.length.should.equal(1);
    });
  });
});

import 'chai/register-should.js';
import request from 'supertest';

import { nanoid } from 'nanoid';
import createServer from '../app.js';

import { seedData } from './helpers/user.js';
import { seedCartProducts } from './helpers/cart.js';
import db from '../db/db.js';
import { createCart } from '../db/cart.js';

import { getOrderById } from '../db/order.js';

const app = createServer();
const api = request(app);

const user = {
  id: nanoid(),
  username: 'test1',
  password: 'password1',
  address_id: 'testtesttesttesttestt',
  fullname: 'Test McTesty',
};

const product = {
  id: nanoid(),
  name: 'test',
  description: 'test description',
  price: '$100.00',
  category: 1,
};

const products = [
  { ...product, name: 'test1', id: nanoid(), quantity: 4 },
  { ...product, name: 'test2', id: nanoid(), quantity: 5 },
  { ...product, name: 'test3', id: nanoid(), quantity: 6 },
];

let cartId;

describe('Orders API', () => {
  beforeEach(async () => {
    await seedData(user);
    cartId = await createCart(user.id);
    await seedCartProducts(products, cartId);
  });
  afterEach(async () => {
    await db.flush();
  });
  describe('POST /orders', () => {
    it('creates an order from a cart', async () => {
      const { status, body } = await api.post('/api/orders').send({ cartId });

      status.should.equal(201);
      const order = await getOrderById(cartId);

      order.products.should.have.deep.members(products);
    });
  });
});

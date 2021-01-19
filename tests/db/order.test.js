import 'chai/register-should.js';
import { nanoid } from 'nanoid';
import db from '../../db/db.js';
import { seedData } from '../helpers/order.js';
import { seedData as seedUser } from '../helpers/user.js';
import parse from 'postgres-date';

import { createOrder, getOrderById } from '../../db/order.js';
import { createCart } from '../../db/cart.js';

const user = {
  id: nanoid(),
  username: 'test1',
  password: 'password1',
  address_id: 'testtesttesttesttestt',
  fullname: 'Test McTesty',
};

const order = {
  id: nanoid(),
  date: new Date(2999, 9, 8),
  addressId: 'testtesttesttesttestt',
  status: 'ordered',
};

describe('Order Database Logic', () => {
  beforeEach(async () => {
    await seedData(order);
    await seedUser(user);
  });
  afterEach(async () => {
    await db.flush();
  });
  it('create order from cart', async () => {
    const date = new Date();
    const cart = await createCart(user.id);

    const newOrder = await createOrder(cart, date);
    const found = await getOrderById(newOrder.id);

    found.should.deep.equal(newOrder);
  });
  it('get an order by its ID', async () => {
    const found = await getOrderById(order.id);

    found.should.deep.equal({ ...order, id: found.id });
  });
});

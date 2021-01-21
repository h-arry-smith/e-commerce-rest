import 'chai/register-should.js';
import { nanoid } from 'nanoid';
import db from '../../db/db.js';
import { seedData } from '../helpers/order.js';
import { seedData as seedUser } from '../helpers/user.js';

import {
  createOrder,
  getOrderById,
  getUserOrders,
  createUserOrder,
} from '../../db/order.js';
import { addProductToCart, createCart } from '../../db/cart.js';
import { add as addProduct } from '../../db/product.js';

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
  address_id: 'testtesttesttesttestt',
  status: 'ordered',
  products: [],
};

const product = {
  id: nanoid(),
  name: 'Test Product',
  description: 'The Big Test Product Is Here!',
  price: '$132.99',
  category: 1,
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
  it('populate orders_products with cart products', async () => {
    const date = new Date();
    const cart = await createCart(user.id);
    await addProduct(product);
    await addProductToCart(cart, product.id, 28);

    const expected = { ...product, quantity: 28 };

    const newOrder = await createOrder(cart, date);
    const found = await getOrderById(newOrder.id);

    found.should.deep.equal(newOrder);
    found.products.should.have.deep.members([expected]);
  });
  it('add a user-order relationship to the database', async () => {
    await createUserOrder(user.id, order.id);
    const expected = [{ user_id: user.id, order_id: order.id }];
    const result = await db
      .query('SELECT * FROM orders_users')
      .then((response) => response.rows);

    result.should.have.deep.members(expected);
  });
  it('creates an order user relationship when creating a cart', async () => {
    const date = new Date();
    const cart = await createCart(user.id);
    await addProduct(product);
    await addProductToCart(cart, product.id, 28);
    await createOrder(cart, date);

    const expected = [{ user_id: user.id, order_id: cart }];

    const userOrders = await getUserOrders(user.id);
    userOrders.should.have.deep.members(expected);
  });
  it('get an order by its ID', async () => {
    const found = await getOrderById(order.id);

    found.should.deep.equal({ ...order, id: found.id });
  });
  it('get a users orders', async () => {
    await createUserOrder(user.id, order.id);
    const found = await getUserOrders(user.id);
    const expected = [{ user_id: user.id, order_id: order.id }];

    found.should.deep.equal(expected);
  });
});

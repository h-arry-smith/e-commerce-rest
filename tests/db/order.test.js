import 'chai/register-should.js';
import { nanoid } from 'nanoid';
import db from '../../db/db.js';
import { seedData } from '../helpers/order.js';
import { seedData as seedUser } from '../helpers/user.js';

import { createOrder, getOrderById, getOrderLines } from '../../db/order.js';
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
  it('get an order by its ID', async () => {
    const found = await getOrderById(order.id);

    found.should.deep.equal({ ...order, id: found.id });
  });
});

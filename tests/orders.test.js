import 'chai/register-should.js';
import request from 'supertest';

import { nanoid } from 'nanoid';
import createServer from '../app.js';

import { seedData } from './helpers/user.js';
import { seedCartProducts } from './helpers/cart.js';
import db from '../db/db.js';
import { addProductToCart, createCart } from '../db/cart.js';

import { createOrder, getOrderById, updateStatus } from '../db/order.js';

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
  {
    ...product,
    name: 'test1',
    id: nanoid(),
    quantity: 4,
  },
  {
    ...product,
    name: 'test2',
    id: nanoid(),
    quantity: 5,
  },
  {
    ...product,
    name: 'test3',
    id: nanoid(),
    quantity: 6,
  },
];

let cartId;

describe('Orders API', () => {
  beforeEach(async () => {
    await db.flush();
    await seedData(user);
    cartId = await createCart(user.id);
    await seedCartProducts(products, cartId);
  });
  afterEach(async () => {
    await db.flush();
  });
  describe('POST /orders', () => {
    it('creates an order from a cart', async () => {
      const { status } = await api.post('/api/orders').send({ cartId });

      status.should.equal(201);
      const order = await getOrderById(cartId);

      order.products.should.have.deep.members(products);
    });
  });
  describe('PUT /orders/', () => {
    it('update the address of an order', async () => {
      await createOrder(cartId, new Date());

      const { status } = await api
        .put('/api/orders')
        .send({ cartId, address_id: 'addresstoupdatetotest' });

      const order = await getOrderById(cartId);

      status.should.equal(200);
      order.address_id.should.equal('addresstoupdatetotest');
    });
    it('cant update to an address that does not exist', async () => {
      await createOrder(cartId, new Date());

      const { status } = await api
        .put('/api/orders')
        .send({ cartId, address_id: 'bad-id' });

      const order = await getOrderById(cartId);

      status.should.equal(400);
      order.address_id.should.equal('testtesttesttesttestt');
    });
    it('update the status of an order to shipped', async () => {
      await createOrder(cartId, new Date());
      const newStatus = 'shipped';

      const { status } = await api
        .put('/api/orders')
        .send({ cartId, status: newStatus });

      const order = await getOrderById(cartId);

      status.should.equal(200);
      order.status.should.equal(newStatus);
    });
    it('update the status of an order to complete', async () => {
      await createOrder(cartId, new Date());
      const newStatus = 'complete';

      const { status } = await api
        .put('/api/orders')
        .send({ cartId, status: newStatus });

      const order = await getOrderById(cartId);

      status.should.equal(200);
      order.status.should.equal(newStatus);
    });
    it('can not update status to anything that isnt a correct order status', async () => {
      await createOrder(cartId, new Date());

      const { status } = await api
        .put('/api/orders')
        .send({ cartId, status: 'bad-status' });

      const order = await getOrderById(cartId);

      status.should.equal(400);
      order.status.should.equal('ordered');
    });
  });
  describe('GET /orders', () => {
    it('gets all orders from the database', async () => {
      await createOrder(cartId, new Date());
      const { status, body } = await api.get('/api/orders');

      status.should.equal(200);
      body.length.should.equal(1);
    });
    it('?full=true returns orders with their products', async () => {
      await createOrder(cartId, new Date());

      const { status, body } = await api.get('/api/orders/?full=true');

      status.should.equal(200);
      body.length.should.equal(1);
      body[0].products.should.have.deep.members(products);
    });
    describe('Order Filtering', () => {
      const filterSetup = async (users) => {
        await seedData(users[0]);
        await seedData(users[1]);
        await seedData(users[2]);

        const carts = [
          await createCart(users[0].id),
          await createCart(users[1].id),
          await createCart(users[2].id),
        ];

        await addProductToCart(carts[0], products[0].id, 1);
        await addProductToCart(carts[1], products[1].id, 2);
        await addProductToCart(carts[2], products[2].id, 3);

        await createOrder(carts[0], new Date());
        await createOrder(carts[1], new Date());
        await createOrder(carts[2], new Date());

        return carts;
      };

      it('get orders by user ID', async () => {
        const users = [
          { ...user, id: nanoid(), username: 'test_one' },
          { ...user, id: nanoid(), username: 'test_two' },
          { ...user, id: nanoid(), username: 'test_three' },
        ];
        const orderIDs = await filterSetup(users);

        const { status, body } = await api.get(
          `/api/orders/?userId=${users[0].id}`
        );

        status.should.equal(200);
        body.length.should.equal(1);
      });
      it('get orders by status', async () => {
        const users = [
          { ...user, id: nanoid(), username: 'test_one' },
          { ...user, id: nanoid(), username: 'test_two' },
          { ...user, id: nanoid(), username: 'test_three' },
        ];
        const orderIDs = await filterSetup(users);

        await updateStatus(orderIDs[1], 'complete');

        const { status, body } = await api.get(`/api/orders/?status=complete`);

        status.should.equal(200);
        body.length.should.equal(1);
        body[0].id.should.equal(orderIDs[1]);
      });
      it('filters work when full is specified', async () => {
        const users = [
          { ...user, id: nanoid(), username: 'test_one' },
          { ...user, id: nanoid(), username: 'test_two' },
          { ...user, id: nanoid(), username: 'test_three' },
        ];
        const orderIDs = await filterSetup(users);

        await updateStatus(orderIDs[1], 'complete');

        const { status, body } = await api.get(
          `/api/orders/?status=complete&full=true`
        );

        status.should.equal(200);
        body.length.should.equal(1);
        body[0].id.should.equal(orderIDs[1]);
      });
    });
  });
  describe('GET /orders/:orderID', () => {
    it('gets a specific order', async () => {
      await createOrder(cartId, new Date());

      const { status, body } = await api.get(`/api/orders/${cartId}`);

      status.should.equal(200);
      body.products.should.have.deep.members(products);
    });
    it('404 if order does not exist', async () => {
      await createOrder(cartId, new Date());

      const { status, body } = await api.get(`/api/orders/bad-id`);

      status.should.equal(404);
    });
  });
});

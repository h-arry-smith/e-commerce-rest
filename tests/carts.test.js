import 'chai/register-should.js';
import request from 'supertest';

import { nanoid } from 'nanoid';
import createServer from '../app.js';

import { seedData } from './helpers/user.js';
import { removeSeedData } from './helpers/cart.js';
import { add as addProduct } from '../db/product.js';
import {
  findById,
  getAll,
  createCart,
  getCartContents,
  addProductToCart,
} from '../db/cart.js';
import { add } from '../db/product.js';

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
  describe('POST /carts/add', () => {
    it('adds a product to cart with quantity', async () => {
      const cartId = await createCart(user.id);
      await addProduct(product);

      const { status } = await api
        .post('/api/carts/add')
        .send({ cartId: cartId, productId: product.id, quantity: 123 });

      status.should.equal(201);

      const contents = await getCartContents(cartId);

      contents.should.be.a.instanceOf(Array);
      contents.length.should.equal(1);
      contents[0].should.deep.equal({ ...product, quantity: 123 });
    });
    it('multiple products will sum rather than create seperate entries', async () => {
      const cartId = await createCart(user.id);
      await addProduct(product);

      await api
        .post('/api/carts/add')
        .send({ cartId: cartId, productId: product.id, quantity: 45 });
      const { status } = await api
        .post('/api/carts/add')
        .send({ cartId: cartId, productId: product.id, quantity: 55 });

      status.should.equal(201);

      const contents = await getCartContents(cartId);

      contents.should.be.a.instanceOf(Array);
      contents.length.should.equal(1);
      contents[0].should.deep.equal({ ...product, quantity: 100 });
    });
    it('can add multiple products in one request', async () => {
      const cartId = await createCart(user.id);
      const products = [
        { ...product, name: 'test1', id: nanoid() },
        { ...product, name: 'test2', id: nanoid() },
        { ...product, name: 'test3', id: nanoid() },
      ];

      await addProduct(products[0]);
      await addProduct(products[1]);
      await addProduct(products[2]);

      let productsToSubmit = [];

      for (let [index, product] of products.entries()) {
        productsToSubmit.push({
          cartId: cartId,
          productId: product.id,
          quantity: index,
        });
      }

      const { status } = await api
        .post('/api/carts/add')
        .send(productsToSubmit);

      status.should.equals(201);

      const contents = await getCartContents(cartId);

      contents.should.be.a.instanceOf(Array);
      contents.length.should.equal(3);
      contents[0].should.deep.equal({ ...products[0], quantity: 0 });
      contents[1].should.deep.equal({ ...products[1], quantity: 1 });
      contents[2].should.deep.equal({ ...products[2], quantity: 2 });
    });
  });
  describe('POST /carts/remove', async () => {
    it('removes all of a single product from the cart', async () => {
      const cartId = await createCart(user.id);
      const products = [
        { ...product, name: 'test1', id: nanoid() },
        { ...product, name: 'test2', id: nanoid() },
        { ...product, name: 'test3', id: nanoid() },
      ];

      await addProduct(products[0]);
      await addProduct(products[1]);
      await addProduct(products[2]);
      await addProductToCart(cartId, products[0].id, 4);
      await addProductToCart(cartId, products[1].id, 5);
      await addProductToCart(cartId, products[2].id, 6);

      const { status } = await api
        .post('/api/carts/remove')
        .send({ cartId: cartId, productId: products[1].id });

      status.should.equal(204);

      const contents = await getCartContents(cartId);

      contents.should.be.a.instanceOf(Array);
      contents.length.should.equal(2);
      contents.should.deep.equal([
        { ...products[0], quantity: 4 },
        { ...products[2], quantity: 6 },
      ]);
    });
    it('removes some of a product from a cart', async () => {
      const cartId = await createCart(user.id);
      const products = [
        { ...product, name: 'test1', id: nanoid() },
        { ...product, name: 'test2', id: nanoid() },
        { ...product, name: 'test3', id: nanoid() },
      ];

      await addProduct(products[0]);
      await addProduct(products[1]);
      await addProduct(products[2]);
      await addProductToCart(cartId, products[0].id, 4);
      await addProductToCart(cartId, products[1].id, 5);
      await addProductToCart(cartId, products[2].id, 6);

      const { status } = await api
        .post('/api/carts/remove')
        .send({ cartId: cartId, productId: products[2].id, quantity: 5 });

      status.should.equal(204);

      const contents = await getCartContents(cartId);

      contents.should.be.a.instanceOf(Array);
      contents.length.should.equal(3);
      contents.should.deep.equal([
        { ...products[0], quantity: 4 },
        { ...products[1], quantity: 5 },
        { ...products[2], quantity: 1 },
      ]);
    });
    it('removes a product completely if the quantity is zero or below', async () => {
      const cartId = await createCart(user.id);
      const products = [
        { ...product, name: 'test1', id: nanoid() },
        { ...product, name: 'test2', id: nanoid() },
        { ...product, name: 'test3', id: nanoid() },
      ];

      await addProduct(products[0]);
      await addProduct(products[1]);
      await addProduct(products[2]);
      await addProductToCart(cartId, products[0].id, 4);
      await addProductToCart(cartId, products[1].id, 5);
      await addProductToCart(cartId, products[2].id, 6);

      const removeOne = await api
        .post('/api/carts/remove')
        .send({ cartId: cartId, productId: products[1].id, quantity: 6 });
      const removeTwo = await api
        .post('/api/carts/remove')
        .send({ cartId: cartId, productId: products[2].id, quantity: 6 });

      removeOne.status.should.equal(204);
      removeTwo.status.should.equal(204);

      const contents = await getCartContents(cartId);

      contents.should.be.a.instanceOf(Array);
      contents.length.should.equal(1);
      contents.should.deep.equal([{ ...products[0], quantity: 4 }]);
    });
    it('removes mutiple products at once', async () => {
      const cartId = await createCart(user.id);
      const products = [
        { ...product, name: 'test1', id: nanoid() },
        { ...product, name: 'test2', id: nanoid() },
        { ...product, name: 'test3', id: nanoid() },
      ];

      await addProduct(products[0]);
      await addProduct(products[1]);
      await addProduct(products[2]);
      await addProductToCart(cartId, products[0].id, 4);
      await addProductToCart(cartId, products[1].id, 5);
      await addProductToCart(cartId, products[2].id, 6);

      const { status } = await api.post('/api/carts/remove').send([
        { cartId, productId: products[0].id },
        { cartId, productId: products[2].id },
      ]);

      status.should.equal(204);

      const contents = await getCartContents(cartId);

      contents.should.be.a.instanceOf(Array);
      contents.length.should.equal(1);
      contents.should.deep.equal([{ ...products[1], quantity: 5 }]);
    });
    it('removes mutiple products at once with differing quantities', async () => {
      const cartId = await createCart(user.id);
      const products = [
        { ...product, name: 'test1', id: nanoid() },
        { ...product, name: 'test2', id: nanoid() },
        { ...product, name: 'test3', id: nanoid() },
      ];

      await addProduct(products[0]);
      await addProduct(products[1]);
      await addProduct(products[2]);
      await addProductToCart(cartId, products[0].id, 4);
      await addProductToCart(cartId, products[1].id, 5);
      await addProductToCart(cartId, products[2].id, 6);

      const { status } = await api.post('/api/carts/remove').send([
        { cartId, productId: products[0].id, quantity: 3 },
        { cartId, productId: products[1].id, quantity: 1 },
        { cartId, productId: products[2].id, quantity: 4 },
      ]);

      status.should.equal(204);

      const contents = await getCartContents(cartId);

      contents.should.be.a.instanceOf(Array);
      contents.length.should.equal(3);
      contents.should.deep.equal([
        { ...products[0], quantity: 1 },
        { ...products[1], quantity: 4 },
        { ...products[2], quantity: 2 },
      ]);
    });
  });
});

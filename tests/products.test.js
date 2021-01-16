import 'chai/register-should.js';
import request from 'supertest';

import express from 'express';
import { nanoid } from 'nanoid';
import createServer from '../app.js';
import db from '../db/db.js';

const app = createServer();

const api = await request(app);

const productData = [
  {
    id: nanoid(),
    name: 'test1',
    description: 'test description',
    price: '$100.00',
    category: 1,
  },
  {
    id: nanoid(),
    name: 'test2',
    description: 'test description',
    price: '$100.00',
    category: 1,
  },
  {
    id: nanoid(),
    name: 'test3',
    description: 'test description',
    price: '$100.00',
    category: 1,
  },
];

const seedData = async (product) => {
  await db.query('INSERT INTO products VALUES ($1, $2, $3, $4, $5);', [
    product.id,
    product.name,
    product.description,
    product.price,
    product.category,
  ]);
};

const removeSeedData = () => {
  db.query('DELETE FROM products');
};

describe('Product API', async () => {
  describe('GET /products', () => {
    it('GET /products returns an empty list when no products in the db', async () => {
      const response = await api
        .get('/api/products')
        .then((response) => response);

      response.status.should.equal(200);
      response.body.should.be.a.instanceOf(Array);
      response.body.length.should.equal(0);
    });
    it('GET /products returns a list of all products', async () => {
      await seedData(productData[0]);
      await seedData(productData[1]);
      await seedData(productData[2]);

      const response = await api
        .get('/api/products')
        .then((response) => response);

      response.status.should.equal(200);
      response.body.should.be.a.instanceOf(Array);
      response.body.length.should.equal(3);
    });
    it('GET /products returns correct product data', async () => {
      await seedData(productData[0]);

      const response = await api
        .get('/api/products')
        .then((response) => response);

      response.status.should.equal(200);
      response.body.should.be.a.instanceOf(Array);
      response.body.length.should.equal(1);

      response.body[0].should.deep.equal(productData[0]);
    });
  });
  describe('GET /products/:productId', () => {
    it('returns the correct product', async () => {
      await seedData(productData[0]);
      await seedData(productData[1]);
      await seedData(productData[2]);

      const response = await api
        .get(`/api/products/${productData[1].id}`)
        .then((response) => response);

      response.status.should.equal(200);
      response.body.should.be.a.instanceOf(Object);
      response.body.should.deep.equal(productData[1]);
    });
    it('returns 404 if product does no exist', async () => {
      const response = await api
        .get(`/api/products/abcdefghijnklmnfxcygf`)
        .then((response) => response);

      response.status.should.equal(404);
    });
  });
  afterEach(async () => {
    await removeSeedData();
  });
});

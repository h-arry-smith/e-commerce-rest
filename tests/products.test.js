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
    category: 2,
  },
  {
    id: nanoid(),
    name: 'test3',
    description: 'test description',
    price: '$100.00',
    category: 2,
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
  describe('GET /products/?category=', () => {
    it('returns a list of products in the selected category', async () => {
      await seedData(productData[0]);
      await seedData(productData[1]);
      await seedData(productData[2]);

      const response = await api
        .get('/api/products/?category=2')
        .then((response) => response);

      response.status.should.equal(200);
      response.body.should.be.a.instanceOf(Array);
      response.body.should.deep.equal([productData[1], productData[2]]);
    });
    it('returns a empty list if the category does not return any results', async () => {
      await seedData(productData[0]);
      await seedData(productData[1]);
      await seedData(productData[2]);

      const response = await api
        .get('/api/products/?category=5')
        .then((response) => response);

      response.status.should.equal(200);
      response.body.should.be.a.instanceOf(Array);
      response.body.length.should.equal(0);
    });
  });
  describe('POST /products', () => {
    it('creates a new product in the database', async () => {
      const response = await api.post('/api/products').send(productData[0]);
      const product = response.body;

      response.status.should.equal(201);

      product.name.should.equal(productData[0].name);
      product.description.should.equal(productData[0].description);
      product.price.should.equal(productData[0].price);
      product.category.should.equal(productData[0].category);
    });
    it('name must not be empty', async () => {
      const badProduct = {
        name: '',
        description: '',
        price: 100,
        category: 1,
      };

      const response = await api.post('/api/products').send(badProduct);
      const products = await db
        .query('SELECT * FROM products WHERE products.name = $1', [
          productData[0].name,
        ])
        .then((response) => response.rows);

      response.status.should.equal(400);
      products.length.should.equal(0);
    });
    it('price must not be negative', async () => {
      const badProduct = {
        name: 'test',
        description: '',
        price: -100,
        category: 1,
      };

      const response = await api.post('/api/products').send(badProduct);
      const products = await db
        .query('SELECT * FROM products WHERE products.name = $1', [
          productData[0].name,
        ])
        .then((response) => response.rows);

      response.status.should.equal(400);
      products.length.should.equal(0);
    });
    it('description is an optional paramater', async () => {
      const noDescription = {
        name: 'test',
        price: 100,
        category: 1,
      };

      const response = await api.post('/api/products').send(noDescription);
      const products = await db
        .query('SELECT * FROM products WHERE products.name = $1', [
          productData[0].name,
        ])
        .then((response) => response.rows);

      response.status.should.equal(201);
      products.length.should.equal(0);
    });
    it('doesnt create product if essential parameters are missing', async () => {
      const badProduct = {
        description: '',
        category: 1,
      };

      const response = await api.post('/api/products').send(badProduct);
      const products = await db
        .query('SELECT * FROM products WHERE products.name = $1', [
          productData[0].name,
        ])
        .then((response) => response.rows);

      response.status.should.equal(400);
      products.length.should.equal(0);
    });
  });
  afterEach(async () => {
    await removeSeedData();
  });
});

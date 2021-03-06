import 'chai/register-should.js';
import request from 'supertest';

import { nanoid } from 'nanoid';
import createServer from '../app.js';
import db from '../db/db.js';

import { seedData, removeSeedData } from './helpers/product.js';
import { findById, getAll } from '../db/product.js';

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

describe('Product API', async () => {
  beforeEach(async () => {
    await seedData(productData[0]);
    await seedData(productData[1]);
    await seedData(productData[2]);
  });
  afterEach(async () => {
    await removeSeedData();
  });

  describe('GET /products', () => {
    it('returns an empty list when no products in the db', async () => {
      await removeSeedData();

      const response = await api.get('/api/products');

      response.status.should.equal(200);
      response.body.should.be.a.instanceOf(Array);
      response.body.length.should.equal(0);
    });
    it('returns a list of all products', async () => {
      const response = await api.get('/api/products');

      response.status.should.equal(200);
      response.body.should.be.a.instanceOf(Array);
      response.body.length.should.equal(3);
    });
    it('returns correct product data', async () => {
      const response = await api.get('/api/products');

      response.status.should.equal(200);
      response.body.should.be.a.instanceOf(Array);
      response.body.length.should.equal(3);

      response.body.should.have.deep.members(productData);
    });
  });
  describe('GET /products/:productId', () => {
    it('returns the correct product', async () => {
      const response = await api.get(`/api/products/${productData[1].id}`);

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
      const response = await api.get('/api/products/?category=2');

      response.status.should.equal(200);
      response.body.should.be.a.instanceOf(Array);
      response.body.should.have.deep.members([productData[1], productData[2]]);
    });
    it('returns a empty list if the category does not return any results', async () => {
      const response = await api.get('/api/products/?category=5');

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
      const products = await getAll();

      response.status.should.equal(400);
      products.length.should.equal(3);
    });
    it('price must not be negative', async () => {
      const badProduct = {
        name: 'test',
        description: '',
        price: -100,
        category: 1,
      };

      const response = await api.post('/api/products').send(badProduct);
      const products = await getAll();

      response.status.should.equal(400);
      products.length.should.equal(3);
    });
    it('description is an optional paramater', async () => {
      const noDescription = {
        name: 'test',
        price: 100,
        category: 1,
      };

      const response = await api.post('/api/products').send(noDescription);
      const products = await getAll();

      response.status.should.equal(201);
      products.length.should.equal(4);
    });
    it('doesnt create product if essential parameters are missing', async () => {
      const badProduct = {
        description: 'unique-test-to-see-it-didnt-make-me',
        category: 1,
      };

      const response = await api.post('/api/products').send(badProduct);
      const products = await getAll();

      response.status.should.equal(400);
      products.length.should.equal(3);
    });
  });
  describe('PUT /products/:productId', async () => {
    it('updates a product in the database', async () => {
      const updatedProduct = { ...productData[0], name: 'test-the-update' };

      const response = await api
        .put(`/api/products/${productData[0].id}`)
        .send(updatedProduct);

      const product = await findById(productData[0].id);

      response.status.should.equal(200);
      product.should.deep.equal(updatedProduct);
    });
    it('returns a 404 if the product id does not exist', async () => {
      const updatedProduct = {
        ...productData[0],
        name: 'test-the-update',
        id: 'testtesttesttesttestt',
      };

      const response = await api
        .put(`/api/products/${updatedProduct.id}`)
        .send(updatedProduct);

      response.status.should.equal(404);
    });
    it('updates a product in the database with partial values', async () => {
      const partialProduct = {
        description: 'partial description update',
      };
      const updatedProduct = { ...productData[0], ...partialProduct };

      const response = await api
        .put(`/api/products/${productData[0].id}`)
        .send(partialProduct);

      const product = await findById(productData[0].id);

      response.status.should.equal(200);
      product.should.deep.equal(updatedProduct);
    });
    it('wont update if the id and param id dont match', async () => {
      const partialProduct = {
        id: 'testtesttesttesttestt',
      };

      const response = await api
        .put(`/api/products/${productData[0].id}`)
        .send(partialProduct);

      response.status.should.equal(400);
    });
    it('wont update if the object is not valid', async () => {
      const partialProduct = {
        price: -1000,
      };

      const response = await api
        .put(`/api/products/${productData[0].id}`)
        .send(partialProduct);

      response.status.should.equal(400);
    });
  });
  describe('DELETE /products/:productId', () => {
    it('should delete a product from the database', async () => {
      const response = await api.delete(`/api/products/${productData[2].id}`);
      const products = await getAll();
      const remainingProducts = [productData[0], productData[1]];

      response.status.should.equal(204);
      products.length.should.equal(2);
    });
    it('should 404 if product isnt found to be deleted', async () => {
      const response = await api.delete(`/api/products/testtesttesttesttestt`);
      const products = await getAll();

      response.status.should.equal(404);
      products.length.should.equal(3);
    });
  });
});

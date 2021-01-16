import 'chai/register-should.js';
import request from 'supertest';
import { nanoid } from 'nanoid';
import { seedData, removeSeedData } from './helpers/product.js';

import db from '../db/db.js';
import createServer from '../app.js';

import { getAll, findById } from '../db/product.js';

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

describe('Product Database Logic', () => {
  beforeEach(async () => {
    await seedData(productData[0]);
    await seedData(productData[1]);
    await seedData(productData[2]);
  });
  afterEach(async () => {
    await removeSeedData();
  });
  it('get all the products from the database', async () => {
    const products = await getAll();

    products.should.deep.equal(productData);
  });
  it('find a product by id', async () => {
    const product = await findById(productData[0].id);

    product.should.deep.equal(productData[0]);
  });
});

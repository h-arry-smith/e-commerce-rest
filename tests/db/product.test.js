import 'chai/register-should.js';
import { nanoid } from 'nanoid';
import { seedData, removeSeedData } from '../helpers/product.js';

import {
  getAll,
  findById,
  findByCategory,
  add,
  update,
  deleteById,
} from '../../db/product.js';

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
  it('find a product by category', async () => {
    const products = await findByCategory(2);

    products.should.deep.equal([productData[1], productData[2]]);
  });
  it('adds a new product to the database', async () => {
    const newProduct = {
      id: nanoid(),
      name: 'test3',
      description: 'adding a product',
      price: 2000,
      category: 3,
    };

    await add(newProduct);

    const products = await getAll();
    products.length.should.equal(4);
  });
  it('updates a product in the database', async () => {
    const updatedProduct = {
      id: productData[0].id,
      name: 'test-updated',
      description: 'description-updated',
      price: '$2,500.00',
      category: 1,
    };

    await update(updatedProduct);

    const products = await getAll();
    const product = await findById(updatedProduct.id);
    products.length.should.equal(3);
    product.should.deep.equal(updatedProduct);
  });
  it('delete a product in the database by id', async () => {
    await deleteById(productData[0].id);

    const products = await getAll();
    products.length.should.equal(2);
  });
});

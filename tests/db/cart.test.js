import 'chai/register-should.js';

import { nanoid } from 'nanoid';
import {
  findById,
  createCart,
  getAll,
  getCartContents,
  addProductToCart,
} from '../../db/cart.js';
import { add as addUser } from '../../db/user.js';
import { add as addProduct } from '../../db/product.js';
import { removeSeedData, seedData } from '../helpers/cart.js';

const carts = [
  { id: nanoid(), user: nanoid() },
  { id: nanoid(), user: nanoid() },
  { id: nanoid(), user: nanoid() },
];

describe('Cart Database Logic', () => {
  beforeEach(async () => {
    await seedData(carts[0]);
    await seedData(carts[1]);
    await seedData(carts[2]);
  });
  afterEach(async () => {
    await removeSeedData();
  });
  it('find cart by id', async () => {
    const cart = await findById(carts[0].id);

    cart.id.should.equal(carts[0].id);
  });
  it('create a new cart', async () => {
    // create a new user to add a new cart with
    const newCartUser = nanoid();
    await addUser({
      id: newCartUser,
      username: 'new-cart-test',
      password: 'junkynunk',
      address_id: 'testtesttesttesttestt',
      fullname: 'Cart Tesert',
    });

    const cartId = await createCart(newCartUser);

    const cart = await findById(cartId);
    cart.id.should.equal(cartId);
    cart.user_id.should.equal(newCartUser);
  });
  it('gets all carts from database', async () => {
    const carts = await getAll();

    carts.should.be.a.instanceOf(Array);
    carts.length.should.equal(3);
  });
  it('gets the contents of a cart by id', async () => {
    const product = {
      id: nanoid(),
      name: 'test-product',
      description: 'test-product-description',
      price: '$123.45',
      category: 1,
    };

    await addProduct(product);
    await addProductToCart(carts[0].id, product.id, 99);

    const cartContents = await getCartContents(carts[0].id);

    cartContents.should.be.a.instanceOf(Array);
    cartContents.length.should.equal(1);
    cartContents[0].should.deep.equal({ ...product, quantity: 99 });
  });
});

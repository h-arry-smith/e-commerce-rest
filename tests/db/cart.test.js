import 'chai/register-should.js';

import { nanoid } from 'nanoid';
import {
  findById,
  createCart,
  getAll,
  getCartContents,
  addProductToCart,
  updateCart,
  removeProductFromCart,
  getProductQuantityFromCart,
} from '../../db/cart.js';
import { add as addUser } from '../../db/user.js';
import { add as addProduct } from '../../db/product.js';
import { removeSeedData, seedData } from '../helpers/cart.js';

const carts = [
  { id: nanoid(), user: nanoid() },
  { id: nanoid(), user: nanoid() },
  { id: nanoid(), user: nanoid() },
];

const product = {
  id: nanoid(),
  name: 'test-product',
  description: 'test-product-description',
  price: '$123.45',
  category: 1,
};

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
  it('update quantity of a product in a cart', async () => {
    await addProduct(product);
    await addProductToCart(carts[0].id, product.id, 13);
    await updateCart(carts[0].id, product.id, 22);

    const cartContents = await getCartContents(carts[0].id);

    cartContents.products.length.should.equal(1);
    cartContents.products.should.have.deep.members([
      { ...product, quantity: 22 },
    ]);
  });
  it('remove product from cart if update is zero or less', async () => {
    await addProduct(product);
    await addProductToCart(carts[0].id, product.id, 13);
    await addProductToCart(carts[1].id, product.id, 8);
    await updateCart(carts[0].id, product.id, 0);
    await updateCart(carts[1].id, product.id, -1);

    const cartContentsOne = await getCartContents(carts[0].id);
    const cartContentsTwo = await getCartContents(carts[1].id);

    cartContentsOne.products.length.should.equal(0);
    cartContentsTwo.products.length.should.equal(0);
  });
  it('multiple cart adds sum totals', async () => {
    await addProduct(product);
    await addProductToCart(carts[0].id, product.id, 13);
    await addProductToCart(carts[0].id, product.id, 27);

    const cartContents = await getCartContents(carts[0].id);

    cartContents.should.be.a.instanceOf(Object);
    cartContents.products.should.be.a.instanceOf(Array);
    cartContents.products.length.should.equal(1);
    cartContents.products.should.have.deep.members([
      { ...product, quantity: 40 },
    ]);
  });
  it('gets the contents of a cart by id', async () => {
    await addProduct(product);
    await addProductToCart(carts[0].id, product.id, 99);

    const cartContents = await getCartContents(carts[0].id);

    cartContents.should.be.a.instanceOf(Object);
    cartContents.products.should.be.a.instanceOf(Object);
    cartContents.products.length.should.equal(1);
    cartContents.products.should.have.deep.members([
      { ...product, quantity: 99 },
    ]);
  });
  it('removes a product completely from the cart', async () => {
    await addProduct(product);
    await addProductToCart(carts[0].id, product.id, 22);

    await removeProductFromCart(carts[0].id, product.id);

    const cartContents = await getCartContents(carts[0].id);

    cartContents.should.be.a.instanceOf(Object);
    cartContents.products.should.be.a.instanceOf(Array);
    cartContents.products.length.should.equal(0);
  });
  it('get a specific quantity of a product from a cart', async () => {
    await addProduct(product);
    await addProductToCart(carts[1].id, product.id, 13);

    const quantity = await getProductQuantityFromCart(carts[1].id, product.id);

    quantity.should.equal(13);
  });
  it('removes a quantity amount from a product', async () => {
    await addProduct(product);
    await addProductToCart(carts[2].id, product.id, 11);

    await removeProductFromCart(carts[2].id, product.id, 6);

    const cartContents = await getCartContents(carts[2].id);

    cartContents.should.be.a.instanceOf(Object);
    cartContents.products.should.be.a.instanceOf(Array);
    cartContents.products.should.deep.equal([{ ...product, quantity: 5 }]);
  });
});

import Router from 'express-promise-router';

import {
  addProductToCart,
  createCart,
  removeProductFromCart,
  updateCart,
} from '../db/cart.js';

const cartsRouter = Router();

cartsRouter.post('/', async (req, res) => {
  let cart_id;

  try {
    cart_id = await createCart(req.body.id);
  } catch (err) {
    res.status(400).send();
    return;
  }

  res.status(201).send({ cart_id });
});

cartsRouter.post('/add', async (req, res) => {
  if (req.body.length === undefined) {
    const { cartId, productId, quantity } = req.body;
    await addProductToCart(cartId, productId, quantity);
  } else {
    for (let product of req.body) {
      await addProductToCart(
        product.cartId,
        product.productId,
        product.quantity
      );
    }
  }

  res.status(201).send();
});

cartsRouter.post('/remove', async (req, res) => {
  if (req.body.length === undefined) {
    const { cartId, productId, quantity } = req.body;
    await removeProductFromCart(cartId, productId, quantity);
  } else {
    for (let product of req.body) {
      await removeProductFromCart(
        product.cartId,
        product.productId,
        product.quantity
      );
    }
  }

  res.status(204).send();
});

cartsRouter.post('/update', async (req, res) => {
  if (req.body.length === undefined) {
    const { cartId, productId, quantity } = req.body;
    await updateCart(cartId, productId, quantity);
  } else {
    for (let product of req.body) {
      await updateCart(product.cartId, product.productId, product.quantity);
    }
  }

  res.status(200).send();
});

export default cartsRouter;

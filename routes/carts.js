import Router from 'express-promise-router';

import { addProductToCart, createCart } from '../db/cart.js';

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

export default cartsRouter;

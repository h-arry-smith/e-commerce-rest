import Router from 'express-promise-router';

import { createCart } from '../db/cart.js';

const cartsRouter = Router();

cartsRouter.post('/', async (req, res) => {
  let cart_id;

  try {
    cart_id = await createCart(req.body.id);
  } catch (err) {
    console.log(err);
    res.status(400).send();
    return;
  }

  res.status(201).send({ cart_id });
});

export default cartsRouter;

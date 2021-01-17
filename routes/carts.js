import Router from 'express-promise-router';

import { createCart } from '../db/cart.js';

const cartsRouter = Router();

cartsRouter.post('/', async (req, res) => {
  const cart_id = await createCart(req.body.id);

  res.status(201).send({ cart_id });
});

export default cartsRouter;

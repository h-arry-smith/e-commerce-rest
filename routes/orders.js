import Router from 'express-promise-router';
import { createOrder } from '../db/order.js';

const orderRouter = Router();

orderRouter.post('/', async (req, res) => {
  const order = await createOrder(req.body.cartId, new Date());

  res.status(201).send(order);
});

export default orderRouter;

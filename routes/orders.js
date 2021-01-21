import Router from 'express-promise-router';
import { createOrder, updateAddress, updateStatus } from '../db/order.js';

const orderRouter = Router();

orderRouter.post('/', async (req, res) => {
  const order = await createOrder(req.body.cartId, new Date());

  res.status(201).send(order);
});

const trueOrErr = async (func) => {
  try {
    await func();
    return true;
  } catch (err) {
    return err;
  }
};

const addressUpdate = async (cartId, address_id) => {
  return trueOrErr(async () => await updateAddress(cartId, address_id));
};
const statusUpdate = async (cartId, status) => {
  return trueOrErr(async () => await updateStatus(cartId, status));
};

orderRouter.put('/', async (req, res) => {
  const { cartId, address_id, status } = req.body;
  if (address_id !== undefined) {
    const result = await addressUpdate(cartId, address_id);
    if (result !== true) {
      res.status(400).send();
    }
  }
  if (status !== undefined) {
    const result = await statusUpdate(cartId, status);
    if (result !== true) {
      res.status(400).send();
    }
  }

  res.status(200).send();
});

export default orderRouter;

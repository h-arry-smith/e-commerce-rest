import { response } from 'express';
import Router from 'express-promise-router';
import {
  createOrder,
  updateAddress,
  updateStatus,
  getAll,
  getOrderById,
  getUserOrders,
} from '../db/order.js';

const orderRouter = Router();

orderRouter.param('orderId', async (req, res, next, id) => {
  const orders = await getAll();
  const index = orders.findIndex((order) => order.id === id);

  if (index === -1) {
    return res.status(404).send('order not found');
  }

  req.orderId = id;
  next();
});

const filterOrdersByUser = async (userId, orders) => {
  if (userId === undefined) {
    return orders;
  }

  let userOrders = await getUserOrders(userId);
  userOrders = userOrders.map((order) => order.order_id);

  return orders.filter((order) => userOrders.includes(order.id));
};

const filterOrdersByStatus = async (status, orders) => {
  if (status === undefined) {
    return orders;
  }
  return orders.filter((order) => order.status === status);
};

orderRouter.get('/', async (req, res) => {
  const { userId, status } = req.query;
  let orders = await getAll(req.query.full);

  orders = await filterOrdersByUser(userId, orders);
  orders = await filterOrdersByStatus(status, orders);

  res.status(200).send(orders);
});

orderRouter.get('/:orderId', async (req, res) => {
  const order = await getOrderById(req.orderId);

  res.status(200).send(order);
});

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

import db from './db.js';
import { findById as findByIdUser } from './user.js';
import { findById as findByIdCart } from './cart.js';

const cast = (order) => {
  return {
    id: order.id,
    status: order.status,
    date: order.date,
    addressId: order.address_id,
  };
};

export const getOrderById = async (id) => {
  const order = await db
    .query('SELECT * FROM orders WHERE id = $1', [id])
    .then((response) => response.rows[0]);

  return cast(order);
};

export const createOrder = async (cartId, date) => {
  const cart = await findByIdCart(cartId);
  const user = await findByIdUser(cart.user_id);
  const address = user.address_id;

  await db.query(
    'INSERT INTO orders (id, date, address_id) VALUES ($1, $2, $3) ',
    [cartId, date, address]
  );

  const order = await getOrderById(cartId);
  return order;
};

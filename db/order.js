import db from './db.js';
import { findById as findByIdUser } from './user.js';
import { findById as findByIdCart, getCartContents } from './cart.js';

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

  return { ...order, products: await getOrderLines(id) };
};

export const createOrder = async (cartId, date) => {
  const { user_id } = await findByIdCart(cartId);
  const contents = await getCartContents(cartId);
  const user = await findByIdUser(user_id);
  const address = user.address_id;

  await db.query(
    'INSERT INTO orders (id, date, address_id) VALUES ($1, $2, $3) ',
    [cartId, date, address]
  );

  // console.log(contents.products);
  await createOrderLines(cartId, contents.products);

  const order = await getOrderById(cartId);
  return order;
};

const createOrderLines = async (id, products) => {
  for (let product of products) {
    console.log(product);
    await db.query('INSERT INTO orders_products VALUES ($1, $2, $3)', [
      id,
      product.id,
      product.quantity,
    ]);
  }
};

export const getOrderLines = async (orderId) => {
  return await db
    .query(
      `SELECT products.id, 
  products.name, 
  products.description, 
  products.price,
  products.category,
  orders_products.quantity as quantity
FROM orders_products
INNER JOIN products ON orders_products.product_id = products.id
WHERE orders_products.order_id = $1`,
      [orderId]
    )
    .then((response) => response.rows);
};

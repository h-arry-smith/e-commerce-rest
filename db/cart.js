import { nanoid } from 'nanoid';
import db from './db.js';

export const findById = async (id) => {
  return await db
    .query('SELECT * FROM carts WHERE carts.id = $1', [id])
    .then((response) => response.rows[0]);
};

export const createCart = async (user_id) => {
  const cart = nanoid();
  await db.query('INSERT INTO carts VALUES ($1, $2)', [cart, user_id]);
  return cart;
};

export const getAll = async () => {
  return await db
    .query('SELECT * FROM carts')
    .then((response) => response.rows);
};

export const addProductToCart = async (cartId, productId, quantity) => {
  await db.query('INSERT INTO carts_products VALUES ($1, $2, $3)', [
    cartId,
    productId,
    quantity,
  ]);
};

export const getCartContents = async (cartId) => {
  return await db
    .query(
      `SELECT products.id, 
          products.name, 
          products.description, 
          products.price,
          products.category,
          carts_products.quantity as quantity
  FROM carts_products
  INNER JOIN products ON carts_products.products_id = products.id
  WHERE carts_products.cart_id = $1`,
      [cartId]
    )
    .then((response) => response.rows);
};

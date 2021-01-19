import { response } from 'express';
import { nanoid } from 'nanoid';
import cartsRouter from '../routes/carts.js';
import productRouter from '../routes/products.js';
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

export const updateCart = async (cartId, productId, quantity) => {
  if (quantity <= 0) {
    return deleteProduct(cartId, productId);
  }

  await db.query(
    'UPDATE carts_products SET quantity = $1 WHERE cart_id = $2 AND products_id = $3',
    [quantity, cartId, productId]
  );
};

export const addProductToCart = async (cartId, productId, quantity) => {
  const find = await db
    .query(
      `SELECT * FROM carts_products
  WHERE carts_products.cart_id = $1
   AND carts_products.products_id = $2`,
      [cartId, productId]
    )
    .then((response) => response.rows[0]);

  if (find) {
    await updateCart(cartId, productId, quantity + find.quantity);
    return;
  }

  await db.query('INSERT INTO carts_products VALUES ($1, $2, $3)', [
    cartId,
    productId,
    quantity,
  ]);
};

export const getCartContents = async (cartId) => {
  const products = await db
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

  return { cartId, products: products ? products : [] };
};

export const deleteCart = async (cartId) => {
  await db.query(`DELETE FROM carts_products WHERE cart_id = $1`, [cartId]);
  await db.query(`DELETE FROM carts WHERE id = $1`, [cartId]);
};

const deleteProduct = async (cartId, productId) => {
  return await db.query(
    `DELETE FROM carts_products WHERE cart_id = $1 AND products_id = $2`,
    [cartId, productId]
  );
};

export const getProductQuantityFromCart = async (cartId, productId) => {
  const response = await db
    .query(
      'SELECT carts_products.quantity FROM carts_products WHERE cart_id = $1 AND products_id = $2',
      [cartId, productId]
    )
    .then((response) => response.rows[0]);

  return response.quantity;
};

export const removeProductFromCart = async (cartId, productId, quantity) => {
  if (!quantity) {
    return await deleteProduct(cartId, productId);
  }

  const existingQuantity = await getProductQuantityFromCart(cartId, productId);
  const newQuantity = existingQuantity - quantity;

  if (newQuantity <= 0) {
    return await deleteProduct(cartId, productId);
  }

  return await updateCart(cartId, productId, newQuantity);
};

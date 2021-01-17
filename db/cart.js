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

import db from './db.js';

export const getAll = async () => {
  return await db
    .query('SELECT * FROM products')
    .then((response) => response.rows);
};

export const findById = async (id) => {
  return await db
    .query('SELECT * FROM products WHERE products.id = $1', [id])
    .then((response) => response.rows[0]);
};

export const findByCategory = async (category) => {
  return await db
    .query('SELECT * FROM products WHERE products.category = $1', [category])
    .then((response) => response.rows);
};

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

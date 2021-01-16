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

export const add = async (product) => {
  return await db.query('INSERT INTO products VALUES ($1, $2, $3, $4, $5)', [
    product.id,
    product.name,
    product.description,
    product.price,
    product.category,
  ]);
};

export const update = async (product) => {
  return await db.query(
    'UPDATE products SET name=$1, description=$2, price=$3, category=$4 WHERE products.id = $5',
    [
      product.name,
      product.description,
      product.price,
      product.category,
      product.id,
    ]
  );
};

export const deleteById = async (id) => {
  return await db.query('DELETE FROM products WHERE products.id = $1', [id]);
};

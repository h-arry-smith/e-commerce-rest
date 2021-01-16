import db from '../../db/db.js';

export const seedData = async (product) => {
  await db.query('INSERT INTO products VALUES ($1, $2, $3, $4, $5);', [
    product.id,
    product.name,
    product.description,
    product.price,
    product.category,
  ]);
};

export const removeSeedData = async () => {
  await db.query('DELETE FROM products');
};

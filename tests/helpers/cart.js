import db from '../../db/db.js';

export const seedData = async (cart) => {
  await db.query('INSERT INTO users VALUES ($1, $2, $3, $4, $5)', [
    cart.user,
    'test' + cart.user,
    'password',
    'testtesttesttesttestt',
    'Testy Test',
  ]);
  await db.query('INSERT INTO carts VALUES ($1, $2);', [cart.id, cart.user]);
};

export const removeSeedData = async () => {
  await db.query('DELETE FROM carts_products');
  await db.query('DELETE FROM carts');
  await db.query('DELETE FROM users');
  await db.query('DELETE FROM products');
};

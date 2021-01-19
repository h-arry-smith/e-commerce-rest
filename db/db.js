import pg from 'pg';

const pool = new pg.Pool();

export default {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  },
  flush: async () => {
    await pool.query('DELETE FROM orders_products');
    await pool.query('DELETE FROM carts_products');
    await pool.query('DELETE FROM orders_users');
    await pool.query('DELETE FROM carts');
    await pool.query('DELETE FROM orders');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM users');
  },
};

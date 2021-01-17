import db from './db.js';

export const getAll = async () => {
  return await db
    .query('SELECT * FROM users')
    .then((response) => response.rows);
};

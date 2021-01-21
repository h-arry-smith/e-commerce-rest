import db from '../../db/db.js';

export const seedData = async (order) => {
  db.query('INSERT INTO orders VALUES ($1, $2, $3, $4)', [
    order.id,
    order.date,
    order.address_id,
    order.status,
  ]);
};

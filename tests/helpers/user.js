import db from '../../db/db.js';

export const seedData = async (user) => {
  await db.query('INSERT INTO users VALUES ($1, $2, $3, $4, $5);', [
    user.id,
    user.username,
    user.password,
    user.address_id,
    user.fullname,
  ]);
};

export const removeSeedData = async () => {
  await db.query('DELETE FROM users');
};

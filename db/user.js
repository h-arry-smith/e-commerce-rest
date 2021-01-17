import { response } from 'express';
import db from './db.js';

export const getAll = async () => {
  return await db
    .query('SELECT * FROM users')
    .then((response) => response.rows);
};

export const findById = async (id) => {
  return await db
    .query('SELECT * FROM users WHERE users.id = $1', [id])
    .then((response) => response.rows[0]);
};

export const add = async (user) => {
  return await db.query('INSERT INTO users VALUES ($1, $2, $3, $4, $5)', [
    user.id,
    user.username,
    user.password,
    user.address_id,
    user.fullname,
  ]);
};

export const update = async (user) => {
  return await db.query(
    'UPDATE users SET username=$1, password=$2, address_id=$3, fullname=$4 WHERE users.id = $5',
    [user.username, user.password, user.address_id, user.fullname, user.id]
  );
};

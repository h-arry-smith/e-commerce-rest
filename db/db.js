import pg from 'pg';

const pool = new pg.Pool();

export default {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  },
};

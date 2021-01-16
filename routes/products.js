import Router from 'express-promise-router';
import db from '../db/db.js';

const productRouter = Router();

productRouter.get('/', async (req, res) => {
  const products = await db
    .query('SELECT * FROM products')
    .then((response) => response.rows);

  res.status(200).send(products);
});

export default productRouter;

import Router from 'express-promise-router';
import db from '../db/db.js';

const productRouter = Router();

productRouter.get('/', async (req, res) => {
  const products = await db
    .query('SELECT * FROM products')
    .then((response) => response.rows);

  res.status(200).send(products);
});

productRouter.get('/:productId', async (req, res) => {
  const product = await db
    .query('SELECT * FROM products WHERE products.id = $1', [
      req.params.productId,
    ])
    .then((response) => response.rows[0]);

  if (!product) {
    res.status(404).send();
  }

  res.status(200).send(product);
});

export default productRouter;

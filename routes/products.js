import Router from 'express-promise-router';
import { nanoid } from 'nanoid';
import db from '../db/db.js';

const validateProduct = (req, res, next) => {
  const product = req.body;

  const requiredParams = ['name', 'price', 'category'];
  if (!requiredParams.every((key) => Object.keys(product).includes(key))) {
    res.status(400).send('Incorrect paramaters');
    return;
  }

  if (product.name === '') {
    res.status(400).send('Name must not be empty');
    return;
  }
  if (product.price < 0) {
    res.status(400).send('Price must be a positive number');
    return;
  }

  next();
};

const productRouter = Router();

productRouter.get('/', async (req, res) => {
  let filter = '';

  if (req.query.category) {
    filter = ` WHERE category = ${req.query.category}`;
  }

  const products = await db
    .query('SELECT * FROM products' + filter)
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

productRouter.post('/', validateProduct, async (req, res) => {
  const product = req.body;

  const newProduct = {
    id: nanoid(),
    name: product.name,
    price: product.price,
    category: product.category,
  };

  newProduct.description = product.description ? product.description : '';

  const id = nanoid();
  await db.query('INSERT INTO products VALUES ($1, $2, $3, $4, $5);', [
    newProduct.id,
    newProduct.name,
    newProduct.description,
    newProduct.price,
    newProduct.category,
  ]);

  res.status(201).send(newProduct);
});

export default productRouter;

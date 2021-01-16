import Router from 'express-promise-router';
import { nanoid } from 'nanoid';
import db from '../db/db.js';

const validate = (product) => {
  const requiredParams = ['name', 'price', 'category'];
  if (!requiredParams.every((key) => Object.keys(product).includes(key))) {
    return 'Incorrect paramaters';
  }
  if (product.name === '') {
    return 'Name must not be empty';
  }
  if (product.price < 0) {
    return 'Price must be a positive number';
  }
  return true;
};

const validateProduct = (req, res, next) => {
  const product = req.body;

  const result = validate(product);
  if (result === true) {
    next();
  } else {
    res.status(400).send(result);
  }
};

const productRouter = Router();

productRouter.param('productId', async (req, res, next, id) => {
  const find = await db
    .query('SELECT * FROM products WHERE products.id = $1', [
      req.params.productId,
    ])
    .then((response) => response.rows[0]);

  if (!find) {
    res.status(404).send();
    return;
  }

  req.product = find;
  next();
});

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
  res.status(200).send(req.product);
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

productRouter.put('/:productId', async (req, res) => {
  const update = { ...req.product, ...req.body };

  const result = validate(update);
  if (result !== true) {
    res.status(400).send(result);
  }

  if (update.id !== req.params.productId) {
    res.status(400).send('Can not change the ID in an update');
  }

  await db.query(
    'UPDATE products SET name=$1, description=$2, price=$3, category=$4 WHERE products.id = $5',
    [update.name, update.description, update.price, update.category, update.id]
  );

  res.status(200).send();
});

export default productRouter;

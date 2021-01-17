import Router from 'express-promise-router';
import { nanoid } from 'nanoid';

import {
  getAll,
  findById,
  findByCategory,
  add,
  update,
  deleteById,
} from '../db/product.js';

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
  const find = await findById(req.params.productId);
  if (!find) {
    res.status(404).send();
    return;
  }

  req.product = find;
  next();
});

productRouter.get('/', async (req, res) => {
  let products;

  if (req.query.category) {
    products = await findByCategory(req.query.category);
  } else {
    products = await getAll();
  }

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
    description: product.description ? product.description : '',
  };

  await add(newProduct);

  res.status(201).send(newProduct);
});

productRouter.put('/:productId', async (req, res) => {
  const updatedProduct = { ...req.product, ...req.body };

  const result = validate(updatedProduct);
  if (result !== true) {
    res.status(400).send(result);
  }

  if (updatedProduct.id !== req.params.productId) {
    res.status(400).send('Can not change the ID in an update');
  }

  await update(updatedProduct);

  res.status(200).send();
});

productRouter.delete('/:productId', async (req, res) => {
  await deleteById(req.product.id);

  res.status(204).send();
});

export default productRouter;

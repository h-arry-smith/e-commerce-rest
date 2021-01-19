import Router from 'express-promise-router';

import {
  addProductToCart,
  createCart,
  getAll,
  getCartContents,
  removeProductFromCart,
  updateCart,
} from '../db/cart.js';

const cartsRouter = Router();

cartsRouter.param('cartId', async (req, res, next, id) => {
  const allCarts = await getAll();
  const index = allCarts.findIndex((e) => e.id === id);
  if (index < 0) {
    return res.status(404).send();
  }

  req.cartId = id;
  next();
});

cartsRouter.get('/', async (req, res) => {
  let carts = await getAll();
  if (req.query.userId) {
    const userCart = carts.map((cart) => {
      if (cart.user_id === req.query.userId) {
        return cart.id;
      }
    })[0];

    if (userCart === undefined) {
      return res.status(404).send();
    }
    carts = await getCartContents(userCart);
  }

  res.status(200).send(carts);
});

cartsRouter.get('/:cartId', async (req, res) => {
  const contents = await getCartContents(req.params.cartId);
  if (contents.length === 0) {
    return res.status(404).send();
  }

  res.status(200).send(contents);
});

cartsRouter.post('/', async (req, res) => {
  let cart_id;

  try {
    cart_id = await createCart(req.body.id);
  } catch (err) {
    res.status(400).send();
    return;
  }

  res.status(201).send({ cart_id });
});

cartsRouter.post('/add', async (req, res) => {
  if (req.body.length === undefined) {
    const { cartId, productId, quantity } = req.body;
    await addProductToCart(cartId, productId, quantity);
  } else {
    for (let product of req.body) {
      await addProductToCart(
        product.cartId,
        product.productId,
        product.quantity
      );
    }
  }

  res.status(201).send();
});

cartsRouter.post('/remove', async (req, res) => {
  if (req.body.length === undefined) {
    const { cartId, productId, quantity } = req.body;
    await removeProductFromCart(cartId, productId, quantity);
  } else {
    for (let product of req.body) {
      await removeProductFromCart(
        product.cartId,
        product.productId,
        product.quantity
      );
    }
  }

  res.status(204).send();
});

cartsRouter.post('/update', async (req, res) => {
  if (req.body.length === undefined) {
    const { cartId, productId, quantity } = req.body;
    await updateCart(cartId, productId, quantity);
  } else {
    for (let product of req.body) {
      await updateCart(product.cartId, product.productId, product.quantity);
    }
  }

  res.status(200).send();
});

export default cartsRouter;

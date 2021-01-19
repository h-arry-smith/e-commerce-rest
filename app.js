import express from 'express';
import morgan from 'morgan';
import cartsRouter from './routes/carts.js';

import productRouter from './routes/products.js';
import userRouter from './routes/users.js';
import orderRouter from './routes/orders.js';

const createServer = () => {
  const app = express();
  const api = express.Router();

  if (process.env.LOGGING === 'true') {
    app.use(morgan('tiny'));
  }

  api.use('/products', productRouter);
  api.use('/users', userRouter);
  api.use('/carts', cartsRouter);
  api.use('/orders', orderRouter);

  app.use(express.json());
  app.use('/api', api);
  return app;
};

export default createServer;

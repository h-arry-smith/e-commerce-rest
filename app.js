import express from 'express';
import morgan from 'morgan';

import productRouter from './routes/products.js';
import userRouter from './routes/users.js';

const createServer = () => {
  const app = express();
  const api = express.Router();

  if (process.env.LOGGING === 'true') {
    app.use(morgan('tiny'));
  }

  api.use('/products', productRouter);
  api.use('/users', userRouter);

  app.use(express.json());
  app.use('/api', api);
  return app;
};

export default createServer;

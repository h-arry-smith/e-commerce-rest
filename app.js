import express from 'express';
import morgan from 'morgan';


const createServer = () => {
  const app = express();
  const api = express.Router();

  if (process.env.LOGGING === 'true') {
    app.use(morgan('tiny'));
  }


  app.use(express.json());
  app.use('/api', api);
  return app;
};

export default createServer;

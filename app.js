import express from 'express';
import morgan from 'morgan';

const app = express();
const port = 3000;

app.use(morgan('tiny'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`server listening at http://localhost:${port}`);
});

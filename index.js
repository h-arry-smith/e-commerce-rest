import createServer from './app.js';

const server = createServer();
const port = 3000;

server.listen(port, () => {
  console.log(`server listening on ${port}`);
});

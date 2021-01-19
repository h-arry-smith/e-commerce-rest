import createServer from './app.js';

import { nanoid } from 'nanoid';
import { seedData } from './tests/helpers/user.js';
import { seedCartProducts } from './tests/helpers/cart.js';
import { createCart } from './db/cart.js';
import db from './db/db.js';

const server = createServer();
const port = 3000;

server.listen(port, () => {
  console.log(`server listening on ${port}`);
});

// seed db
if (process.env.NODE_ENV === 'dev') {
  console.log('Seeding database...');
  const user = {
    id: nanoid(),
    username: 'test1',
    password: 'password1',
    address_id: 1,
    fullname: 'Test McTesty',
  };

  const product = {
    id: nanoid(),
    name: 'test',
    description: 'test description',
    price: '$100.00',
    category: 1,
  };

  const products = [
    { ...product, name: 'test1', id: nanoid(), quantity: 4 },
    { ...product, name: 'test2', id: nanoid(), quantity: 5 },
    { ...product, name: 'test3', id: nanoid(), quantity: 6 },
  ];

  await db.flush();
  await seedData(user);
  const cartId = await createCart(user.id);
  await seedCartProducts(products, cartId);
}

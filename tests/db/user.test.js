import 'chai/register-should.js';
import { nanoid } from 'nanoid';
import { seedData, removeSeedData } from '../helpers/user.js';

import { getAll, findById } from '../../db/user.js';

const users = [
  {
    id: nanoid(),
    username: 'test1',
    password: 'password1',
    address_id: 'testtesttesttesttestt',
    fullname: 'Test McTesty',
  },
  {
    id: nanoid(),
    username: 'test2',
    password: 'password2',
    address_id: 'testtesttesttesttestt',
    fullname: 'Test McCatch',
  },
  {
    id: nanoid(),
    username: 'test3',
    password: 'password3',
    address_id: 'testtesttesttesttestt',
    fullname: 'Test McTry',
  },
];

describe('User Database Logic', async () => {
  beforeEach(async () => {
    await seedData(users[0]);
    await seedData(users[1]);
    await seedData(users[2]);
  });
  afterEach(async () => {
    await removeSeedData();
  });
  it('get all users from database', async () => {
    const users = await getAll();

    users.should.be.a.instanceOf(Array);
    users.length.should.equal(3);
  });
  it('finds a user by id', async () => {
    const user = await findById(users[0].id);

    user.should.be.a.instanceOf(Object);
    user.should.deep.equal(users[0]);
  });
});

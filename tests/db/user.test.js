import 'chai/register-should.js';
import { nanoid } from 'nanoid';
import { seedData, removeSeedData } from '../helpers/user.js';

import { getAll, findById, add, update, deleteById } from '../../db/user.js';

const newUser = {
  id: nanoid(),
  username: 'new-user',
  password: 'new-user-password',
  address_id: 'testtesttesttesttestt',
  fullname: 'Newbie Testmcface',
};

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
  it('adds a new user', async () => {
    await add(newUser);
    const users = await getAll();

    users.length.should.equal(4);
  });
  it('updates a user', async () => {
    const updateUser = {
      id: users[0].id,
      username: 'change-the-name',
      password: 'change-the-password',
      address_id: 'testtesttesttesttestt',
      fullname: 'Name Changey',
    };

    await update(updateUser);
    const user = await findById(updateUser.id);

    user.should.deep.equal(updateUser);
  });
  it('deletes a user', async () => {
    await deleteById(users[0].id);
    const allUsers = await getAll();

    allUsers.length.should.equal(2);
  });
});

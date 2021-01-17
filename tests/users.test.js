import 'chai/register-should.js';
import request from 'supertest';

import { nanoid } from 'nanoid';
import createServer from '../app.js';

import { removeSeedData, seedData } from './helpers/user.js';

const app = createServer();

const api = await request(app);

const userData = [
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

describe('Users API', () => {
  beforeEach(async () => {
    await seedData(userData[0]);
    await seedData(userData[1]);
    await seedData(userData[2]);
  });
  afterEach(async () => {
    await removeSeedData();
  });
  describe('GET /users', async () => {
    it('returns an empty list of when no users in the DB', async () => {
      await removeSeedData();
      const { status, body } = await api.get('/api/users');

      status.should.equal(200);
      body.should.be.a.instanceOf(Array);
      body.length.should.equal(0);
    });
    it('returns a list of all users', async () => {
      const { status, body } = await api.get('/api/users');

      status.should.equal(200);
      body.should.be.a.instanceOf(Array);
      body.length.should.equal(3);
    });
    it('returns correctly formatted user objects', async () => {
      const { status, body } = await api.get('/api/users');

      status.should.equal(200);
      body.should.be.a.instanceOf(Array);
      body.should.deep.equal(userData);
    });
  });
  describe('GET /users/:userId', () => {
    it('returns the correct user', async () => {
      const { status, body } = await api.get(`/api/users/${userData[0].id}`);

      status.should.equal(200);
      body.should.be.a.instanceOf(Object);
      body.should.deep.equal(userData[0]);
    });
    it('returns a 404 if the user doesnt exist', async () => {
      const { status } = await api.get(`/api/users/testtesttesttesttestt`);

      status.should.equal(404);
    });
  });
});

import 'chai/register-should.js';
import request from 'supertest';

import { nanoid } from 'nanoid';
import createServer from '../app.js';

import { removeSeedData, seedData } from './helpers/user.js';
import { findById, getAll } from '../db/user.js';

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
  describe('POST /users', async () => {
    it('creates a new user', async () => {
      const newUser = {
        username: 'new-user',
        password: 'new-user-password',
        address_id: 'testtesttesttesttestt',
        fullname: 'Newbie Testubey',
      };

      const { status, body } = await api.post(`/api/users`).send(newUser);

      status.should.equal(201);
      body.username.should.equal(newUser.username);
      body.password.should.equal(newUser.password);
      body.address_id.should.equal(newUser.address_id);
      body.fullname.should.equal(newUser.fullname);
    });
    it('wont add two users with the same user names', async () => {
      const newUser = {
        username: 'new-user',
        password: 'new-user-password',
        address_id: 'testtesttesttesttestt',
        fullname: 'Newbie Testubey',
      };

      await api.post(`/api/users`).send(newUser);
      const { status, body } = await api.post(`/api/users`).send(newUser);
      const users = await getAll();

      status.should.equal(400);
      users.length.should.equal(4);
    });
    it('all fields are required', async () => {
      const badUser = {};

      const { status, body } = await api.post(`/api/users`).send(badUser);
      const users = await getAll();

      status.should.equal(400);
      users.length.should.equal(3);
    });
    describe('validation', () => {
      it('validates the username field is string', async () => {
        const badUser = {
          username: -1,
          password: 'new-user-password',
          address_id: 'testtesttesttesttestt',
          fullname: 'Newbie Testubey',
        };

        const { status, body } = await api.post(`/api/users`).send(badUser);
        const users = await getAll();

        status.should.equal(400);
        users.length.should.equal(3);
      });
      it('validates the password field is string', async () => {
        const badUser = {
          username: 'new-user',
          password: -1,
          address_id: 'testtesttesttesttestt',
          fullname: 'Newbie Testubey',
        };

        const { status, body } = await api.post(`/api/users`).send(badUser);
        const users = await getAll();

        status.should.equal(400);
        users.length.should.equal(3);
      });
      it('validates the address_id is of the correct format', async () => {
        const badUser = {
          username: 'new-user',
          password: 'new-user-password',
          address_id: 'bad-id',
          fullname: 'Newbie Testubey',
        };

        const { status, body } = await api.post(`/api/users`).send(badUser);
        const users = await getAll();

        status.should.equal(400);
        users.length.should.equal(3);
      });
    });
  });
  describe('PUT /users/:userId', async () => {
    it('updates a user in the database', async () => {
      const updateUser = {
        id: userData[0].id,
        username: 'change-the-name',
        password: 'change-the-password',
        address_id: 'testtesttesttesttestt',
        fullname: 'Name Changey',
      };

      const { status, body } = await api
        .put(`/api/users/${updateUser.id}`)
        .send(updateUser);
      const user = await findById(userData[0].id);

      status.should.equal(200);
      user.should.deep.equal(updateUser);
    });
    it('returns a 404 if id is not found', async () => {
      const updateUser = {
        id: 'bad-id',
        username: 'change-the-name',
        password: 'change-the-password',
        address_id: 'testtesttesttesttestt',
        fullname: 'Name Changey',
      };

      const { status, body } = await api
        .put(`/api/users/${updateUser.id}`)
        .send(updateUser);
      const user = await findById(userData[0].id);

      status.should.equal(404);
      user.should.deep.equal(userData[0]);
    });
    it('updates with partial values', async () => {
      const updateUser = {
        id: userData[0].id,
        username: 'change-the-name',
        password: 'change-the-password',
      };

      const { status, body } = await api
        .put(`/api/users/${updateUser.id}`)
        .send(updateUser);
      const user = await findById(userData[0].id);

      status.should.equal(200);
      user.username.should.equal(updateUser.username);
      user.password.should.equal(updateUser.password);
    });
    it('must have the same id and param id', async () => {
      const updateUser = {
        id: 'bad-id',
        username: 'change-the-name',
        password: 'change-the-password',
        address_id: 'testtesttesttesttestt',
        fullname: 'Name Changey',
      };

      const { status, body } = await api
        .put(`/api/users/${userData[0].id}`)
        .send(updateUser);
      const user = await findById(userData[0].id);

      status.should.equal(400);
      user.should.deep.equal(userData[0]);
    });
    it('validates the object and 400 if invalid', async () => {
      const updateUser = {
        id: -1,
        username: 'change-the-name',
        password: 'change-the-password',
        address_id: 'testtesttesttesttestt',
        fullname: 'Name Changey',
      };

      const { status, body } = await api
        .put(`/api/users/${userData[0].id}`)
        .send(updateUser);
      const user = await findById(userData[0].id);

      status.should.equal(400);
      user.should.deep.equal(userData[0]);
    });
  });
});

import Router from 'express-promise-router';
import { nanoid } from 'nanoid';
import { getAll, findById, add } from '../db/user.js';

const userRouter = Router();

const validate = (user) => {
  if (typeof user.username !== 'string') {
    return 'username must be a string';
  }
  if (typeof user.password !== 'string') {
    return 'password must be a string';
  }
  if (typeof user.address_id !== 'string' || user.address_id.length !== 21) {
    return 'incorrect address id';
  }

  return true;
};

const userValidation = (req, res, next) => {
  const valid = validate(req.body);

  if (valid === true) {
    next();
  } else {
    res.status(400).send(valid);
    return;
  }
};

userRouter.param('userId', async (req, res, next, id) => {
  const find = await findById(req.params.userId);

  if (!find) {
    res.status(404).send();
    return;
  }

  req.user = find;
  next();
});

userRouter.get('/', async (req, res) => {
  const users = await getAll();

  res.status(200).send(users);
});

userRouter.get('/:userId', async (req, res) => {
  res.status(200).send(req.user);
});

userRouter.post('/', userValidation, async (req, res) => {
  const userObject = { ...req.body, id: nanoid() };

  try {
    await add(userObject);
  } catch (err) {
    res.status(400).send(err.message);
    return;
  }
  res.status(201).send(userObject);
});

export default userRouter;

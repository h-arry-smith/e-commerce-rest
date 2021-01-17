import { response } from 'express';
import Router from 'express-promise-router';
import { nanoid } from 'nanoid';
import { getAll, findById } from '../db/user.js';

const userRouter = Router();

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

export default userRouter;

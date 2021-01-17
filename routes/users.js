import Router from 'express-promise-router';
import { nanoid } from 'nanoid';
import { getAll } from '../db/user.js';

const userRouter = Router();

userRouter.get('/', async (req, res) => {
  const users = await getAll();

  res.status(200).send(users);
});

export default userRouter;

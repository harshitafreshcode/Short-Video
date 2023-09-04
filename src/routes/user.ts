import express, { Request, Response } from 'express'
import { createUser, editUser, getAllUser, removeUser } from '../Controller/userController';
const userRouter = express.Router()


/**
 * @openapi
   * /user:
   *  get:
   *     tags:
   *     - user
   *     summary: Get User.
   *     description: Responds if the app is up and running
   *     responses:
   *       200:
   *         description: App is up and running
   */
userRouter.get("/user", (req: Request, res: Response) => {
    res.send('This Is User Router... ');
});

export default userRouter;

import express, { Request, Response } from 'express'
import { createUser, editUser, getAllUser, removeUser } from '../Controller/userController';
import { createVideos, generateClip, getVideosInfo } from '../Controller/videoController';
import { generateClipText, generateClipTitle, generateClipTitleUsingRapid, generateClips } from '../Controller/textGenerateController';
import { titleClip } from '../Controller/textToTitleController';
import { VidoeRecord, recordVidoe } from '../Controller/RecordVidoeController';
const router = express.Router()
// Craete Schema to give ref
/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - phone
 *         - password
 *       properties:
*                     first_name:
*                       type: string
*                       description: The user's first name.
*                       example: Leanne Graham
*                     last_name:
*                       type: string
*                       description: The user's last name.
*                       example: Leanne Graham
*                     email:
*                       type: string
*                       description: The user's email.
*                       example: test@gmail.com
*                     phone:
*                       type: string
*                       description: The user's phone.
*                       example: 1234567893
*                     password:
*                       type: string
*                       description: The user's password.
*                       example: Test@123
*                     role_id:
*                       type: integer
*                       description: The user's role id.
*                       example: 1
*                     status:
*                       type: boolean
*                       description: The user's status.
*                       example: 1
*/

/**
 * @openapi
   * /get-all-user:
   *  get:
   *     security:
   *        - bearerAuth: []
   *     tags:
   *     - user
   *     summary: Get User.
   *     description: Responds if the app is up and running
   *     responses:
   *       200:
   *         description: Get All User Successfully.
   *       409:
   *         description: Conflict
   *       400:
   *         description: Bad request
   *           
   */
router.get("/get-all-user", getAllUser);

/**
 * @openapi
 * /add-user:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - user
 *     summary: create a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       409:
 *         description: Conflict
 *       400:
 *         description: Bad request
 */
router.post("/add-user", createUser);

/**
*@openapi
* /edit-user/{id}:
*   patch:
*    tags:
*      - user
*    summary: Update a single User
*    parameters:
*      - name: id
*        in: path
*        description: The id of the User
*        required: true
*    requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/User'
*    responses:
*       200:
*         description: Success
*         content:
*          application/json:
*           schema:
*              $ref: '#/components/schemas/User'
*       403:
*         description: Forbidden
*       404:
*         description: User not found
*/

router.patch("/edit-user/:id", editUser);

/**
* @openapi
* /delete-user/{id}:
*    delete:
*     tags:
*     - user
*     summary: Delete a single user
*     parameters:
*      - name: id
*        in: path
*        description: The id of the product
*        required: true

*     responses:
*       200:
*         description: User deleted
*       403:
*         description: Forbidden
*       404:
*         description: Product not found
*/
console.log('123');
router.delete("/delete-user/:id", removeUser);
router.post('/creat-vidoes', createVideos)
router.post('/get-vidoes-info', getVideosInfo)
router.post('/generate-clip', generateClip)

//* Text Controllers
router.post('/create-clips', generateClips)
router.post('/generate-clip-text', generateClipText)
//* Title Generator
router.post('/generate-clip-title', titleClip)

//! For test 
router.post('/generate-clip-title-demo', generateClipTitle) //demo 
router.post('/generate-clip-title-rapid', generateClipTitleUsingRapid)//demo

router.post('/record-vidoe', VidoeRecord)
export default router;



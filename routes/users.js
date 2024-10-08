import express from 'express';
import controller from '../controller/userController.js'
const router = express.Router();

router.get('/passenger',controller.selectUser);
router.get('/driver', controller.selectUser);
router.post('/passenger',controller.authenticateUser,controller.userValidation);
router.post('/admin',controller.authenticateUser,controller.userValidation);
router.post('/driver',controller.authenticateUser,controller.userValidation);

router.post('/passenger/register',controller.register);
router.post('/driver/register',controller.registerDriver);
// /changepassword
router.post('/passenger/changepassword',controller.authenticateUser,controller.changePassword);
router.post('/admin/changepassword',controller.authenticateUser,controller.changePassword);
router.post('/driver/changepassword',controller.authenticateUser,controller.changePassword);
export default router;

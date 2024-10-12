import express from 'express';
import controller from '../controller/busController.js';
const router = express.Router();


//router.get('/search');
router.get('/all',controller.listBus);
router.get('/nodriver',controller.busWithoutDrivers);

router.post('/register',controller.registerBus);












export default router;
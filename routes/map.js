import express from 'express';
import mapController from '../controller/mapController.js';
const router = express.Router();


router.get('/start/:startPoint/end/:endPoint', mapController.getDirection);



export default router;




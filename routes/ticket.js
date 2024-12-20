import express from 'express';
import ticketController from '../controller/ticketController.js';
const router = express.Router();


router.get('/all',ticketController.getAllTicket);
router.get('/search',ticketController.getTrips);
router.get('/view',ticketController.viewPassengers);
export default router;
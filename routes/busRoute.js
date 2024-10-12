import express from 'express';
import busRouteController from '../controller/busRouteController.js';
const router = express.Router();


router.get('/list',busRouteController.listDriverWithPassenger);
router.get("/available",busRouteController.getAvailableRoute);
router.get('/search',busRouteController.searchRoutes);
router.post("/book",busRouteController.bookTrip);
router.post('/set',busRouteController.setRoute);



export default router;
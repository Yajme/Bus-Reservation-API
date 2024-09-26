import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const apiKey = process.env.OPEN_ROUTE_SERVICE_APIKEY;
const baseURL = 'https://api.openrouteservice.org/v2/directions/driving-car?';
const requestDirection = async (startingPoint, endPoint) => {

	const request = `${baseURL}api_key=${apiKey}&start=${startingPoint}&end=${endPoint}`;
	try {

		const response = await axios.get(request);

		return response;
	} catch (error) {
		throw error;
	}
};


const getDirection = async (req, res, next) => {
	try {
		const startPoint = req.params.startPoint;
		const endPoint = req.params.endPoint;

		const directions = await requestDirection(startPoint, endPoint);

		res.json(directions.data);

	} catch (error) {
		console.log(error);
		next(error);
	}
}



export default { getDirection };

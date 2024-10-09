import dotenv from 'dotenv';
import axios from 'axios';
import ORS from '../utils/OpenRouteServicesAPI.js';

dotenv.config();
const apiKey = process.env.OPEN_ROUTE_SERVICE_APIKEY;
const baseURL = 'https://api.openrouteservice.org/';


const autocomplete = async (req, res, next)=>{
	try{
		
		const text = req.params.text;
		const constraints = 'boundary.country=PH&layers=country,region,locality';
		const request = `${baseURL}geocode/autocomplete?api_key=${apiKey}&text=${text}&${constraints}`;

		const response = await axios.get(request);
		res.json(response.data);
	}catch(error){
		console.log(error);
		next(error);
	}
}
const getDirection = async (req, res, next) => {
	try {
		const startPoint = req.params.startPoint;
		const endPoint = req.params.endPoint;

		const directions = await ORS.requestDirection(startPoint, endPoint);

		res.json(directions.data);

	} catch (error) {
		console.log(error);
		next(error);
	}
}



export default { getDirection,autocomplete };

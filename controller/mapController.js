import dotenv from 'dotenv';
import axios from 'axios';
import ORS from '../utils/OpenRouteServicesAPI.js';

dotenv.config();
const apiKey = process.env.OPEN_ROUTE_SERVICE_APIKEY;
const baseURL = 'https://api.openrouteservice.org/';


const autocomplete = async (req, res, next)=>{
	try{
		/* https://api.openrouteservice.org/geocode/autocomplete?api_key=5b3ce3597851110001cf6248069c18f57a1e40dd9ef9069ab99b8df3&text=Lipa&boundary.country=PH&layers=country,region,locality
		https://api.openrouteservice.org/v2/geocode/autocomplete?api_key=5b3ce3597851110001cf6248069c18f57a1e40dd9ef9069ab99b8df3&text=Lipa&boundary.country=PH&layers=country,region,locality
		*/
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

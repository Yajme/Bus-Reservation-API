import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const apiKey = process.env.OPEN_ROUTE_SERVICE_APIKEY;
const baseURL = 'https://api.openrouteservice.org/';


const requestDirection = async (startingPoint, endPoint) => {

	const request = `${baseURL}v2/directions/driving-car?api_key=${apiKey}&start=${startingPoint}&end=${endPoint}`;
	try {

		const response = await axios.get(request);

		return response;
	} catch (error) {
		throw error;
	}
};

const geocodeSearch = async (query)=>{
    const request = `${baseURL}/geocode/search?api_key=${apiKey}&text=${query}&boundary.country=PH`;

    try{
        const response = await axios.get(request);

		return response.data;
    }catch(error){
        console.log(error);
        throw error;
    }

}



export default {
requestDirection,
geocodeSearch,

};
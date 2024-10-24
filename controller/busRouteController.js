import firebase from './firebase.js';
import ORS from '../utils/OpenRouteServicesAPI.js';
import {getDistanceFromLatLonInKm, isNearby} from '../utils/HaversineFormula.js';
import { collection } from 'firebase/firestore';
import moment from 'moment';
const COLLECTION = 'routes';
const routeFields = [
    'origin',
    'origin_coordinates',
    'destination',
    'destination_coordinates',
    'trip_date',
    'available_seats',
    'bus',
    'total_seats',
    'bus_line',
    'id'
];
const getAvailableRoute = async (req,res,next)=>{

    try{
        
        const selectedFields = routeFields;
        const query = {
            key : 'trip_date',
            Logic : '>=',
            Param : new Date()
        }
        const data = await firebase.getDocumentByParam(COLLECTION, query,selectedFields);


        res.json(data);
    }catch(error){
        next(error);
    }
};

const scheduledTrip = async(req,res,next)=>{

}

const setQuery = (key,logic,param)=>{
    return {
        key: key,
        Logic: logic,
        Param : param
    }
}
const searchRoutes = async(req,res,next)=>{
    try{
        const destination = req.query.destination;
        const date = new Date(req.query.date);
        const bus_line = req.query.bus_line;
        

        //if query have origin
        const current_location = req.query.current_location;
        //Available on home
        const seat = req.query.seat;
        //The constraints here is, how available the bus is
        //for example : 
        //if a seat_available is 30
        //and the seat = 29
        //then its true


        //get here

        let Queries = [
            setQuery('destination','==',destination),
            setQuery('trip_date','>=',date),
        ]

        if(seat){
            Queries.push(setQuery('available_seats',">=",Number(seat)));
        }

       
        
        //console.log(Queries);
        let data = await firebase.getDocumentByParam(COLLECTION,Queries,routeFields);
        if(bus_line){
            const modified_data = [];
            for(const doc of data){
                const bus = doc.bus;
                if(bus.bus_line === bus_line){
                    modified_data.push(doc);
                }
            }

            if(modified_data){
                data = modified_data;
            }
        }
        
        if(current_location){
            const modified_data = [];
            const searchLocation = await ORS.geocodeSearch(current_location);


            const features = searchLocation.features[0];

            const latitude = features.geometry.coordinates[1];
            const longitude = features.geometry.coordinates[0];
            
            for(const doc of data){
                const origin_coordinates = doc.origin_coordinates;

                const origin_latitude = origin_coordinates.latitude;
                const origin_longitude = origin_coordinates.longitude;
                const distance= getDistanceFromLatLonInKm(latitude,longitude,origin_latitude,origin_longitude);
            
                const nearby = isNearby(distance,10);
                if(nearby){
                    modified_data.push(doc);
                }
            }

            if(modified_data){
                data = modified_data;
            }
        }
        if(data.length < 1) return res.status(404).json({message:"No Route Found"});
        res.status(200).json(data);
        //res.json(data);
    }catch(error){

        console.log(error);
    }
};

const listDriverWithPassenger = async (req,res,next)=>{
    try{
        const selectedFields = [
            'trip_date',
            'bus',
            'bus_line',
            'total_seats',
            'available_seats',
            'driver_id',
            'first_name',
            'last_name',



        ]

        const data = await firebase.getDocuments(COLLECTION,selectedFields);

        console.log(data);
        let responses = [];
        for(const trip of data){
            const doc = {
                id :trip.id,
                trip_date : trip.trip_date,
                bus_line : trip.bus.bus_line,
                driver_name : `${trip.bus.driver_id.first_name} ${trip.bus.driver_id.last_name}`,
                passenger_count : Number(trip.bus.total_seats)-Number(trip.available_seats)
            }
            responses.push(doc);
        }

        if(responses.length < 1) return res.status(404).json({message : 'No Data Found'});

        res.status(200).json(responses);
    }catch(error){
        console.log(error);
    }
}
//--------------------------------
//-------POST REQUEST-------------
//--------------------------------


const bookTrip = async (req,res,next)=>{
    try{
        
        const seat_occupation = req.body.seat_occupation;
        let passenger_id = req.body.passenger_id;
        const user_id = req.body.user_id;
        const route_id = req.body.route_id;
        
        const data = await firebase.getDocumentById(COLLECTION,route_id,['available_seats']);
        const busSeats = Number(data.available_seats);
        const seats = Number(seat_occupation);
        //Validate available seats;
        if(seats > busSeats) throw Error('Number of seats exceeds available seats');

        if(user_id != null && passenger_id == null){
            const data = await firebase.createDocumentReference('users',user_id);
            const query = setQuery('user_id','==',data);
            const passengerRef = await firebase.getDocumentByParam('passenger',query,['id']);
            passenger_id = passengerRef[0].id;
        }
       let refDoc = [];

       refDoc.push({
        collectionName : 'passenger',
        doc_id : passenger_id,
        key : 'passenger'
       });

       refDoc.push({
        collectionName : 'routes',
        doc_id : route_id,
        key : 'route'
       });

       const booking_date =  moment().utcOffset(8).toDate();
       const randomNum = Math.floor(1000 + Math.random() * 9000);
       const ticket_number = booking_date.getTime().toString()+randomNum.toString();
       const setData = {
        booking_date : booking_date,
        ticket_number : ticket_number
       }

     const doc_id = await firebase.setDocument('tickets',setData,refDoc);

     const ticket_ref = {
        collectionName : 'tickets',
        doc_id : doc_id,
        key: 'ticket'
     }
     
     
     //Updating available seats
    
     const newAvailableSeats = busSeats - seats;
     const newData = {
        available_seats : newAvailableSeats
     }
     await firebase.updateData(COLLECTION,newData,route_id);
      // Generate a random number between 1000 and 9999
    
       res.status(200).json({ message: 'Ticket reserved', ticket_number: ticket_number});

    }catch(error){
        console.log(error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

//Driver Side

const setRoute = async (req,res,next)=>{
    try{
        const driver_id = req.body.id;

        const driverRef = await firebase.createDocumentReference('driver',driver_id);
        const busQuery = setQuery('driver_id','==',driverRef);
        const busDoc = await firebase.getDocumentByParam('buses',busQuery,['id','total_seats']);

        const bus_id = busDoc[0].id;
        //Get the bus here first
        //Then get the bus capacity


        const destination = req.body.destination;
        const destination_coordinates = firebase.toGeopoint(req.body.destination_coordinates.latitude,req.body.destination_coordinates.longitude);
        const origin = req.body.origin;
        const origin_coordinates = firebase.toGeopoint(req.body.origin_coordinates.latitude,req.body.origin_coordinates.longitude);
        const trip_date = new Date(Date.parse(req.body.trip_date));
        const available_seats =busDoc[0].total_seats;

       

        //Set the values here
        const setData = {
            available_seats : available_seats,
            destination : destination,
            destination_coordinates : destination_coordinates,
            origin : origin,
            origin_coordinates : origin_coordinates,
            trip_date : trip_date
        };

        const bus_ref = {
            doc_id : bus_id,
            collectionName : 'buses',
            key : 'bus'
        }
        const data = await firebase.setDocument(COLLECTION,setData,[bus_ref]);
        if(!data) return res.status(400).json({message : 'Route failed to register'});
        res.status(200).json({message : 'Route registered'});
        //Update
    }catch(error){
        res.status(400).json({message : error.message});
    }
}
export default {
getAvailableRoute,
bookTrip,
searchRoutes,
setRoute,
listDriverWithPassenger
};
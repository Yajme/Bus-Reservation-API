import firebase from './firebase.js';

const COLLECTION = 'tickets';
const ticketFields = [
    'booking_date',
     'passenger',
     'last_name',
     'first_name',
     'route',
     'trip_date',
      'origin',
      'origin_coordinates',
      'destination',
      'destination_coordinates',

]
const setQuery = (key,logic,param)=>{
    return {
        key: key,
        Logic: logic,
        Param : param
    }
}
const getAllTicket = async (req,res,next)=>{
    try{
        const data = await firebase.getDocuments(COLLECTION,ticketFields);
        
        res.send(data);
    }catch(error){
        console.log(error);
        next(error);
    }
}

const getTrips = async (req,res,next)=>{
    try{
        const role = req.query.role;
        const filter = req.query.filter;
        const user_id = req.query.user_id;
        const getUser = await firebase.createDocumentReference('users',user_id);
        const query = setQuery('user_id','==',getUser);
        if(role === 'passenger'){
            //collection == tickets

            //current bus
            //upcoming trip
            //past bus trip
            //reserved trips

            
            const getPassenger = await firebase.getDocumentByParam('passenger',query,['id']);
            //console.log(getPassenger);
            const passenger_id = getPassenger[0].id;

            //Create a document reference for searching ticket;
            const passengerRef = await firebase.createDocumentReference('passenger',passenger_id);
            //Search for ticket
            const queryTicket = setQuery('passenger','==',passengerRef);
            const tickets = await firebase.getDocumentByParam(COLLECTION,queryTicket,ticketFields);
            //res.json(tickets);
            let data=[];
            for(const ticket of tickets){
                const trip_date = ticket.route.trip_date.toDate();
                const now = new Date();
                if(filter === 'current bus'){
                    
                    if(trip_date.getHours() == now.getHours()&& trip_date.getMinutes() <= now.getMinutes() && now.getDate()===trip_date.getDate()){
                            return res.json(ticket);
                        }
                   
                }
    
                if(filter=== 'upcoming trip'){
    
                    //Trips that are coming in an hour 
                    //now.hour - 1 == tripdate.hour
                    console.log(`${now.getHours()+1}==${trip_date.getHours()} : ${now.getHours()+1 === trip_date.getHours()}`);
                    if(now.getHours()+1 === trip_date.getHours() && now.getDate() ===  trip_date.getDate()){
                        data.push(ticket);
                    }
                }
    
                if(filter === 'past bus trip' || filter === 'past_bus_trip' ){
                    //TripDate < Now
                    if(trip_date.getTime() < now.getTime() && trip_date.getDate() < now.getDate()){
                        data.push(ticket);
                    }
                }
    
                if(filter === 'reserved trip' || filter === 'reserved_trip'){
                    //TripDate > Now
                    if(trip_date.getTime() >= now.getTime() && trip_date.getDate() >= now.getDate()){
                        data.push(ticket);
                    }
                }
    
            }
            

            if(!data ||  data.length === 0) return res.status(404).json({message : "No Data Found"});
            res.status(200).json(data);
        }else if(role === 'driver'){
            //collection == routes

            //scheduled trip

            //trip_date >= now

            //Driver

            const getDriver = await firebase.getDocumentByParam('driver',query,['id']);
            const driver_id = getDriver[0].id;
            const driverRef = await firebase.createDocumentReference('driver',driver_id);
            const queryBus = setQuery('driver_id','==',driverRef);
            const getBus = await firebase.getDocumentByParam('buses',queryBus,'id');
            const bus_id = getBus[0].id;
            const busRef = await firebase.createDocumentReference('buses',bus_id);
            const queryRoute = setQuery('bus','==',busRef);
            const getRoute = await firebase.getDocumentByParam('routes',queryRoute,['trip_date','origin','destination']);
            const now = new Date();

            let data= [];
            for(const route of getRoute){
                const trip_date = route.trip_date.toDate();
                
                if(trip_date.getDate() >= now.getDate() && trip_date.getTime() >= now.getTime()){
                    data.push(route);
                }
            }
            res.status(200).json(data);
        }else{
            return res.status(401).json({message : 'Unauthorized access'});
        }
    }catch(error){
        console.log(error);
    }
}

export default {
    getAllTicket,
    getTrips    
};

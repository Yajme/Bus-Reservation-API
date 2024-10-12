import firebase from './firebase.js';

const COLLECTION_NAME = 'buses';
const selectedFields = [
    'bus_line',
    'bus_number',
    'bus_type',
    'driver_id',
    'first_name',
    'last_name',
    'registration_number',
    'status',
    'total_seats'
]
const listBus = async (req,res,next)=>{
    try{
        
        const buses = await firebase.getDocuments(COLLECTION_NAME,selectedFields);
        if(buses.length < 1) return res.status(404).json({message : 'no data found'});

        res.status(200).json(buses);
    }catch(error){
        console.log(error);
        next(error);
    }
}


// POST REQUEST
const registerBus = async (req,res,next)=>{
    try{
        const driver_id = req.body.driver_id;
        const bus_line = req.body.bus_line;
        const registration = req.body.registration;
        const bus_number = req.body.bus_number;
        const bus_type = req.body.bus_type;
        const total_seats = req.body.total_seats;

        if(!driver_id) return res.status(404).json({message : 'Invalid id'});

        const driverRef = await firebase.createDocumentReference('driver',driver_id);
        

        const setData = {
            bus_line : bus_line,
            bus_number : bus_number,
            bus_type : bus_type,
            driver_id : driverRef,
            registration_number : registration,
            status: "available",
            total_seats : Number(total_seats)
        }

        const setDoc = await firebase.setDocument(COLLECTION_NAME,setData);
        if(!setDoc) return res.status(400).json({message : "Failed to register bus"});

        res.status(200).json({message : "Bus Registered!"});
    }catch(error){
        console.log(error);
        next(error);
    }
}



export default {
    listBus,
    registerBus
}
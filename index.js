import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import firebase from './controller/firebase.js';
import mapRoute from './routes/map.js';
import ticketRoute from './routes/ticket.js';
import busRoute from './routes/busRoute.js';
import userRoute from './routes/users.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();

//Initialization
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
firebase.initializeFirebase();

app.get("/",(request,response)=>{
response.send("API Up");
});

//Routes
app.use("/assets",express.static(__dirname + '/public'));
app.use("/map", mapRoute);
app.use("/ticket",ticketRoute);
app.use("/routes",busRoute);
app.use("/users",userRoute);

//catches non existent url
app.get('*', (req, res, next) => {
    const requestedURL = req.url;
    const error = new Error('Wrong URL ' + requestedURL + " is not existent");
    error.status = 404; // You can set the status to 404 or any other appropriate status code.
    
    next(error); // Pass the error to the error-handling middleware.
});

app.use((err, req, res, next) => {  
    res.status(err.status || 500).send(err.message);
});
//App Start
const PORT =  process.env.PORT;
app.listen(PORT, ()=> {
console.log(`Server listening at http://localhost:${PORT}`);
});

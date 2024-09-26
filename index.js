import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mapRoute from './routes/map.js';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.get("/",(request,response)=>{

response.send("HELLO WORLD");
});


app.use("/map", mapRoute);
const PORT =  process.env.PORT;
app.listen(PORT, ()=> {
console.log(`Server listening at http://localhost:${PORT}`);
});

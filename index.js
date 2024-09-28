import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mapRoute from './routes/map.js';
import assetRoute from './routes/assets.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.get("/",(request,response)=>{

response.send("HELLO WORLD");
});

app.use("/assets",assetRoute(__dirname));
app.use("/map", mapRoute);
const PORT =  process.env.PORT;
app.listen(PORT, ()=> {
console.log(`Server listening at http://localhost:${PORT}`);
});

import express from 'express';
import path from 'path';import fs from 'fs';


// Function to list all directories synchronously
const listDirectoriesSync = (dirPath) => {
    let dir = '';
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
        dir += `${file} \n`;
      console.log(file);  // This is a directory
    }
  });

  return dir;
};

// Usage: Provide the directory path where you want to list folders

const router = express.Router();

const routerSetup = (projectRoot) => {
    router.use('/image', express.static(path.join(projectRoot, 'public/assets')));
    router.get('/test',(req,res)=>{
       const d = listDirectoriesSync(projectRoot); 
        res.send(d);
    })

    
    return router;
  };




export default routerSetup;
import express from 'express';
import path from 'path';
const router = express.Router();

const routerSetup = (projectRoot) => {
    router.use('/image', express.static(path.join(projectRoot, 'public/assets')));
  

    
    return router;
  };




export default routerSetup;
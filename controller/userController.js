import firebase from './firebase.js';


const COLLECTION_NAME='users';
const selectUser = async(req,res,next)=>{
    try{

        
    }catch(error){

    }
}
const authenticateUser = async (req,res,next)=>{
    try{
        const username = req.body.username;
        const password = req.body.password;

        
        const constraints = {
            key : 'username',
            Logic : '==',
            Param : username
        }
        const selectedFields =  [
            'id',
            'password',
            'role'
        ]
        const getCredentials = await firebase.getDocumentByParam(COLLECTION_NAME,constraints,selectedFields);
        
        const credential_password = getCredentials[0].password;
        const id = getCredentials[0].id;
        if(credential_password !== password) return res.status(401).json({message : 'Invalid Password or username'});

        const role  = getCredentials[0].role;
        //res.status(200).json({message : "Authorized", role : role, id: id});

        res.locals.authenticated = {message : "Authorized", role : role, id: id};
        return next();
    }catch(error){

        next(error);
    }
}

const userValidation = (req,res,next) =>{
    try{
        const rawUrl = req.url;
        let url = rawUrl.replace(/^\/+|\/+$/g, '');
        const role = res.locals.authenticated.role;
        if(role !== url) return res.status(400).json({message : 'Unauthorized access'});

        res.json(res.locals.authenticated);
    }catch(error){
        next(error);
    }
}


const register = async(req,res,next)=>{
    try{

    }catch(error){
    
    }
}

const changePassword = async(req,res,next)=>{
    try{
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;
        if(newPassword !== confirmPassword) return res.status(400).json({message : 'New password and confirm password must match!'});
        const doc_id = req.locals.authenticated.id;

        const newData = {
            password : newPassword
        }
        const data = await firebase.updateData(COLLECTION_NAME,newData,doc_id);
        if(!data) return res.status(400).json({message : 'Unable to update password'});
        res.status(200).json({message : 'Password updated'});
    }catch(error){
        next(error);
    }
}

export default {
authenticateUser,
register,
userValidation,
changePassword
};

import firebase from './firebase.js';


const COLLECTION_NAME='users';
const selectUser = async(req,res,next)=>{
    try{
        const id = req.query.id;
        const role = req.query.role;
        if(!id || id === null) return res.status(401).json({message : 'Invalid query'});

        const data = await firebase.createDocumentReference(COLLECTION_NAME,id);

        const constraints = {
            key : 'user_id',
            Logic : '==',
            Param : data
        };

        const selectedFields = [
            'first_name',
            'last_name'
        ]
        const userRef = await firebase.getDocumentByParam(role,constraints,selectedFields);

        if(!userRef || userRef.length < 1) return res.status(404).json({message : 'User not found, did you put the correct id?'});
        const userDoc = userRef[0];

        
        res.status(200).json(userDoc);
    }catch(error){
        console.log(error);
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
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const username = req.body.username;
        const password = req.body.password;

        //validate if username exist within the firestore;
        const usernameConstraint  = { 
            key : 'username',
            Logic : '==',
            Param : username
        };
        const checkUsername = await firebase.getDocumentByParam(COLLECTION_NAME,usernameConstraint,['id']);
        if(checkUsername.length > 0) return res.status(409).json({message : 'Username already exist'});
        const setDataUser = {
            username : username,
            password : password
        }

        const data = await firebase.setDocument(COLLECTION_NAME,setDataUser);
        if(!data || data === '') return res.status(400).json({message : 'User did not register, please try again.'});

       
        const userRef = await firebase.createDocumentReference(COLLECTION_NAME,data);

        const setDataPassenger = {
            first_name :first_name,
            last_name : last_name,
            user_id : userRef
        }

        await firebase.setDocument('passenger',setDataPassenger);

        res.status(200).json({message : 'User registered!'})
    }catch(error){
        next(error);
    }
}

const registerDriver = async(req,res,next)=>{
    try{
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const username = req.body.username;
        const password = req.body.password;

        //validate if username exist within the firestore;
        const usernameConstraint  = { 
            key : 'username',
            Logic : '==',
            Param : username
        };
        const checkUsername = await firebase.getDocumentByParam(COLLECTION_NAME,usernameConstraint,['id']);
        if(checkUsername.length > 0) return res.status(409).json({message : 'Username already exist'});
        const setDataUser = {
            username : username,
            password : password
        }

        const data = await firebase.setDocument(COLLECTION_NAME,setDataUser);
        if(!data || data === '') return res.status(400).json({message : 'User did not register, please try again.'});

       
        const userRef = await firebase.createDocumentReference(COLLECTION_NAME,data);

        const setDataDriver= {
            first_name :first_name,
            last_name : last_name,
            user_id : userRef
        }

        await firebase.setDocument('driver',setDataDriver);

        res.status(200).json({message : 'User registered!'})
    }catch(error){
        next(error);
    }
}
const changePassword = async(req,res,next)=>{
    try{
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;
        if(newPassword !== confirmPassword) return res.status(400).json({message : 'New password and confirm password must match!'});
        const doc_id = res.locals.authenticated.id;

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
registerDriver,
userValidation,
changePassword,
selectUser
};

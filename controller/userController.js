import firebase from './firebase.js';


const COLLECTION_NAME='users';
const userCount = async(req,res,next)=>{
    try{
        const id = req.query.id;
        if(!id) return res.status(401).json({message : 'Invalid id'});
        const admin = await firebase.getDocumentById(COLLECTION_NAME,id,['role','id']);
        if(admin.role !== 'admin') return res.status(401).json({message : 'Invalid id'});

        const users = await firebase.getDocuments(COLLECTION_NAME,['role']);
        let passengerCount = 0;
        let driverCount = 0;


        console.log(users);
        for(const user of users){
            if(user.role === 'passenger'){
                passengerCount++;
            }

            if(user.role === 'driver'){
                driverCount++;
            }
        }

        const data = {
            passenger_count : passengerCount,
            driver_count : driverCount
        }

        res.status(200).json(data);
    }catch(error){
        console.log(error);
    }
}
const listUser = async(req,res,next)=>{
    try{
        const role = req.query.role;
        //admin id is a must
        const id = req.query.id;

        //Check first if id is an admin
        const admin = await firebase.getDocumentById(COLLECTION_NAME,id,['role','id']);
        if(admin.role !== 'admin') return res.status(401).json({message : 'Invalid id'});

        if(role === 'admin' || !role) return res.status(401).json({message : 'Invalid role'});
        const getUsers = await firebase.getDocuments(role,['id','first_name','last_name']);

        if(getUsers.length < 1) return res.status(404).json({message : "no data found"});

        return res.status(200).json(getUsers);
    }catch(error){
        console.log(error);
    }
}
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

        next();
    }catch(error){
        next(error);
    }
}
const registerUserDevice = async (req,res,next)=>{
    try{
        const id = res.locals.authenticated.id;
        const token = req.body.token;
        if(res.locals.authenticated.role == 'passenger' && !token || token == null){
           return next();
        }

        const userRef = await firebase.createDocumentReference(COLLECTION_NAME,id);
        const constraint = {
            key : 'user_id',
            Logic : '==',
            Param : userRef
        }
        const getDriver = await firebase.getDocumentByParam('driver',constraint,['id']);
        const driverId =  getDriver[0].id;
        const driverRef = await firebase.createDocumentReference('driver',driverId);
        //check first if token already exist
        //then if the id is existent proceed to next()
        const constraints = {
            key : 'token',
            Logic : '==',
            Param : token
        }
        const checkToken = await firebase.getDocumentByParam('devices',constraints,['id','token',]);
        if(checkToken.length > 0)  return next();
        const setData = { 
            token : token,
            driver : driverRef
        }

        await firebase.setDocument('devices',setData);
        next();
    }catch(error){
        next(error);
    }
}
const respondAuth = (req,res,next) =>{
    try{
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
            password : password,
            role : 'passenger'
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
            password : password,
            role : 'driver'
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
const logout = async(req,res,next)=>{
    try{
        const token = req.body.token;
        const constraint = {
            key : 'token',
            Logic : '==',
            Param : token
        }
        const getDoc = await firebase.getDocumentByParam('devices',constraint,['id']);
        const id = getDoc[0].id;

        const deleted = await firebase.deleteDocument('devices',id);
        if(!deleted) res.json({message: 'Token deleted unsuccessfully'});

        res.status(200).json({message : "Token Deleted Successfully"});
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
selectUser,
listUser,
userCount,
respondAuth,
registerUserDevice,
logout
};

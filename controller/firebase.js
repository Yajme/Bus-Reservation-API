// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import dotenv from 'dotenv';
import { Firestore,doc,setDoc,collection,getDocs, getFirestore, query,where, orderBy, limitToLast, AggregateField,sum,getAggregateFromServer, count, updateDoc, DocumentReference,getDoc, documentId, GeoPoint, Timestamp} from "firebase/firestore";
import { get } from "firebase/database";

dotenv.config();
// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};


// Initialize Firebase

let app;
let firestoreDb;


//Create here 

const initializeFirebase = ()=>{
    try{
        app = initializeApp(firebaseConfig);
        firestoreDb = getFirestore(app);
        return app;
    }catch(err){
        console.log(`${err}`);
    }
}


const updateData = async(collectionName,newData,documentId)=>{
    try{
        const docRef = doc(firestoreDb,collectionName,documentId);

        await updateDoc(docRef,newData);

        return true;
    }catch(error){
        console.log(`${error}`);
        throw error;
    }
}

const fetchDocumentData = async (docSnap,selectedFields = [])=>{
    try{

        const docData = docSnap.data();
        let finalData = {};

        for (const [key, value] of Object.entries(docData)) {
            if (value instanceof DocumentReference) {
              console.log(`Found nested DocumentReference in field '${key}'`);
        
              // Recursively fetch the referenced document
              const nestedDocSnap = await getDoc(value);
              if (nestedDocSnap.exists()) {
                // Recursively handle the nested referenced document
                finalData[key] = await fetchDocumentData(nestedDocSnap,selectedFields); 
              } else {
                console.log(`Referenced document in field '${key}' does not exist`);
                finalData[key] = null;
              }
            } else {
              // If it's not a DocumentReference, just add it to the final data
              finalData[key] = value;
            }
          }
        
          // Only return the selected fields if specified
  if (selectedFields.length > 0) {
    finalData = selectedFields.reduce((acc, field) => {
      if (finalData[field]) acc[field] = finalData[field];
      return acc;
    }, {});
  }

  return finalData;
    }catch(error){
        console.log(error);
    }
};
const getDocuments = async (collectionName, selectedFields=[])=>{
try{
   
    const collectionRef = collection(firestoreDb, collectionName);
    
    const querySnapshot = await getDocs(collectionRef);
    let finalData = [];

    for (const docSnap of querySnapshot.docs) {
      const docId = docSnap.id;
      console.log(`Document ID: ${docId}`);

      // Fetch the document data, including nested DocumentReferences
      const docData = await fetchDocumentData(docSnap, selectedFields);
      finalData.push({ id: docId, ...docData });
    }

    
    return finalData;
}catch(error){
    console.log(error);
}
}
const getDocumentByParamWithId = async (collectionName,documentId,constraint={},selectedFields =[])=>{
    try{
  // Get a reference to the specific document
  const docRef = doc(firestoreDb, collectionName, documentId);
    
  const q = query(
    docRef,
    where(constraint.key,constraint.Logic,constraint.Param)
)
  // Retrieve the document snapshot
  const docSnap = await getDoc(q);

  // Check if the document exists
  if (docSnap.exists()) {
    console.log(`Document ID: ${documentId}`);

    // Fetch the document data, and filter based on selected fields if needed
    const docData = docSnap.data();

    // Filter the document data if selectedFields are provided
    let finalData = {};
    if (selectedFields.length > 0) {
      selectedFields.forEach(field => {
        if (docData[field] !== undefined) {
          finalData[field] = docData[field];
        }
      });
    } else {
      finalData = docData; // Return full document data if no fields are selected
    }

    return { id: documentId, ...finalData };
  } else {
    console.log("No such document!");
    return null;
  }
    }catch(error){
        console.log(error);
    }
}
//
const getDocumentByParam = async (collectionName,constraint={},selectedFields =[])=>{
    try{
        const collectionRef = collection(firestoreDb,collectionName);

        let Where = [];
        if(typeof constraint === 'object' && constraint.key && constraint.Logic && constraint.Param){
          Where = [  where(constraint.key,constraint.Logic,constraint.Param)];
        }else if(Array.isArray(constraint)){
          for(const item of constraint){
            Where.push(where(item.key,item.Logic,item.Param));
          }
        }

        const q = query(
            collectionRef,
           ...Where
        )

        const querySnapshot = await getDocs(q);
        let finalData = [];
        for (const docSnap of querySnapshot.docs) {
            const docId = docSnap.id;
            console.log(`Document ID: ${docId}`);
      
            // Fetch the document data, including nested DocumentReferences
            const docData = await fetchDocumentData(docSnap, selectedFields);
            finalData.push({ id: docId, ...docData });
          }
      

          return finalData;
    }catch(error){
        console.log(error);
    }
}

const setDocument = async (collectionName, setData = {}, refDoc =[])=>{
    try{
        //const docRef = doc(firestoreDb,collectionName,documentId);
        if(refDoc && refDoc.length > 0 && Array.isArray(refDoc)){
          for(const ref of refDoc){
            const refDocSnapshot =doc(firestoreDb, ref.collectionName, ref.doc_id);
            
            setData[ref.key] = refDocSnapshot;

        }
        }
        
        //[key] = ref

        const docRef = doc(collection(firestoreDb,collectionName));

        await setDoc(docRef,setData);

        return docRef.id;
    }catch(error){
        console.log(error);
        throw error;
    }
}
const toGeopoint = (latitude,longitude)=>{
  return new GeoPoint(latitude,longitude);
}
const toTimestamp = (seconds,nanoseconds)=>{
  return new Timestamp(seconds,nanoseconds);
}
const getDocumentById = async (collectionName,documentId,selectedFields =[])=>{
  
    try{
        // Get a reference to the specific document
    const docRef = doc(firestoreDb, collectionName, documentId);
    
    // Retrieve the document snapshot
    const docSnap = await getDoc(docRef);

    // Check if the document exists
    if (docSnap.exists()) {
      console.log(`Document ID: ${documentId}`);

      // Fetch the document data, and filter based on selected fields if needed
      const docData = docSnap.data();

      // Filter the document data if selectedFields are provided
      let finalData = {};
      if (selectedFields.length > 0) {
        selectedFields.forEach(field => {
          if (docData[field] !== undefined) {
            finalData[field] = docData[field];
          }
        });
      } else {
        finalData = docData; // Return full document data if no fields are selected
      }

      return { id: documentId, ...finalData };
    } else {
      console.log("No such document!");
      return null;
    }



        
    }catch(error){
        console.log(error);
    }
};
const getFilteredData = async(collectionName,Param,key,Logic,Limit,order)=>{
    try{
        
        const collectionRef = collection(firestoreDb,collectionName);
        const finalData = [];
        let q;
        if(Limit != 0){
             q = query(collectionRef,
                where(key,Logic,Param),
                orderBy(key,order),
                limitToLast(Limit)
            );
            console.log(key,Logic,Param);
        }else{
             q = query(collectionRef,
                where(key,Logic,Param),
                orderBy(key,order)
            );
            console.log(key,Logic,Param);
        }
        
        
        const docSnap = await getDocs(q);
        
        docSnap.forEach((doc)=>{
            finalData.push(doc.data());
            
        });

        return finalData;

    }catch(error){
        console.log(`${error}`);
        throw error;
    }
}
const getSum = async(collectionName,Param,key)=>{
    try{
        const collectionRef = collection(firestoreDb,collectionName);
        let Where;
        if(typeof Param === "object"){
            Where = [];
            Param.forEach((query)=>{
                console.log(`${query.key} ${query.param}`)
                Where.push(
                    where(query.key,query.logic,query.param)
                );
            })
        }else{
            Where = [
                where(key,"==",Param)
            ]
        }
        const q = query(
            collectionRef,
            ...Where
        )
        const snapshot = await getAggregateFromServer(
            q,
            {
                total: sum(key),
                totalRecord : count(key)
            },
        );

        return snapshot.data();
    }catch(error){
        throw error;
    }
}

const createDocumentReference= async(collectionName,documentId)=>{
  try {
    // Create a DocumentReference using the collection name and document ID
    const docRef = doc(firestoreDb, collectionName, documentId);

    return docRef;
  } catch (error) {
    console.error('Error fetching document:', error);
  }
}
const uploadData = async()=>{
    try{
        /*
        for (const key in history) {
            if (history.hasOwnProperty(key)) {
              const document = doc(firestoreDb,"threshold",key);
              let dataUpload = await setDoc(document,history[key]);
            }
          }
            */

          for (const key in history) {
            if (history.hasOwnProperty(key)) {
              history[key].timestamp = new Date(history[key].timestamp);
              const document = doc(firestoreDb,"contamination",key);
              let dataUpload = await setDoc(document,history[key]);
            }
          }
    }catch(error){
        console.log(error);
    }
}
const getFirebaseApp = () => app;

export default {
    initializeFirebase,
    getFirebaseApp,
    getDocumentByParam,
    updateData,
    getDocuments,
    getDocumentById,
    setDocument,
    getDocumentByParamWithId,
    createDocumentReference,
    toGeopoint,
    toTimestamp
};
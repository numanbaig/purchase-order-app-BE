// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const {getFirestore} = require("firebase/firestore")

const firebaseConfig = {
  apiKey: "AIzaSyDHWWV0pu1vEWtOJ_NlMMYmefzhxU5j0UU",
  authDomain: "whatsapp-bot-5a906.firebaseapp.com",
  projectId: "whatsapp-bot-5a906",
  storageBucket: "whatsapp-bot-5a906.appspot.com",
  messagingSenderId: "243328844905",
  appId: "1:243328844905:web:39123249fd67ca498acef8",
  measurementId: "G-4DBZ2Y72BD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
module.exports= {db}
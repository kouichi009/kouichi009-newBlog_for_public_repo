import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";

// import {
//   currentHostname,
//   location,
//   TEST_HOSTNAME,
//   PRODUCT_HOSTNAME
// } from "~/apis/constant_type";
// import location from "~/apis/constant_type";

// let boolean = process.browser ? true : false;

// if (boolean) return;

// if (process.browser) {
// windowやdocumentを使う処理を記述
// const fullPath = window.location;
// const hostname1 = window.location.hostname;

// console.log(
//   "firebase plugin@@@@@@@@@@@@@@: ",
//   hostname,
//   typeof hostname,
//   SOLD_DATE_AT,
//   fullPath,
//   fullPath.hostname
// );

////////////////////////////
////////////////////////////
if (!firebase.apps.length) {
  // if (currentHostname === TEST_HOSTNAME || currentHostname === "") {
  var firebaseConfig = {
    apiKey: process.env.FIREBASE_APIKEY,
    authDomain: process.env.FIREBASE_AUTHDOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECTID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
    appId: process.env.FIREBASE_APPID,
    measurementId: process.env.FIREBASE_MEASUREMENTID
  };
  firebase.initializeApp(firebaseConfig);
}

// if (currentHostname === PRODUCT_HOSTNAME) {
//   var productFirebaseConfig = {
//     apiKey: process.env.FIREBASE_APIKEY,
//     authDomain: process.env.FIREBASE_AUTHDOMAIN,
//     databaseURL: process.env.FIREBASE_DATABASE_URL,
//     projectId: process.env.FIREBASE_PROJECTID,
//     storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
//     appId: process.env.FIREBASE_APPID,
//     measurementId: process.env.FIREBASE_MEASUREMENTID
//   };
//   firebase.initializeApp(productFirebaseConfig);
//   console.log("productFirebaseConfig@@: ", currentHostname);
// }
// firebase.firestore().settings({
//   timestampsInSnapshots: true
// });
// }
// console.log("firebase plugin@ 2 @@@@@@@@@@@@@@: ", firebase);
// console.log("boolean@@@ 2");

const db = firebase.firestore();
export { db, firebase };
// console.log("boolean@@@ 3 ", firebase, typeof firebase, typeof db);

// }

// debugger;

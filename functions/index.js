const functions = require("firebase-functions");
const admin = require("firebase-admin");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const express = require("express");
const paymentRouter = require("./routes/payment");
const contactusRouter = require("./routes/contactus");
const uploadfilesRouter = require("./routes/uploadfiles");
const postModule = require("./triggers/post");
const commentModule = require("./triggers/comment");

// 解説 https://www.youtube.com/watch?v=d--IghG-AvM&list=PLgNEd6Q0CH8E6zHmqsO7EIcqsDEeVD089&index=14
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccountKey),
//   databaseURL: "https://blog-test01-ec54b.firebaseio.com"
// });

admin.initializeApp();

const app = express();

dotenv.config();
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", paymentRouter);
app.use("/", uploadfilesRouter);
app.use("/", contactusRouter);

exports.api = functions.https.onCall(app);
exports.postModule = postModule;
exports.commentModule = commentModule;

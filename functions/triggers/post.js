const functions = require("firebase-functions");
const admin = require("firebase-admin");
const export_api = require("../helper/api");
const { uuid } = require("uuidv4");
const NOTIFICATIONS = "notifications";

exports.onNotificationLikes = functions.firestore
  .document("posts/{postId}/likes/{uid}")
  .onCreate(async (snapshot, context) => {
    const postId = context.params.postId;
    const post = await export_api.fetchPost(postId);
    const uid = context.params.uid;

    // if (post.user.uid === uid) {
    //   console.log("same user likes 1111111111 @!!!!!!!!!!!!!@@@@@@@@@@@@@@@@");
    //   return;
    // }
    // console.log(
    //   "same user likes 2222222222222222222 @!!!!!!!!!!!!!@@@@@@@@@@@@@@@@"
    // );

    const notificationId = admin
      .firestore()
      .collection("users")
      .doc().id;
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const notificationsRef = admin
      .firestore()
      .collection("users")
      .doc(post.user.uid)
      .collection(NOTIFICATIONS)
      .doc(notificationId);

    notificationsRef.set({
      id: notificationId,
      info: {
        type: "like",
        keyword: ""
      },
      from: uid,
      to: post.user.uid,
      isSeen: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
      postId: postId,
      commentId: ""
    });
  });

exports.onNotificationPaid = functions.firestore
  .document("posts/{postId}/paid/{uid}")
  .onCreate(async (snapshot, context) => {
    const postId = context.params.postId;
    const post = await export_api.fetchPost(postId);
    const uid = context.params.uid;

    const notificationId = admin
      .firestore()
      .collection("users")
      .doc().id;
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const notificationsRef = admin
      .firestore()
      .collection("users")
      .doc(post.user.uid)
      .collection(NOTIFICATIONS)
      .doc(notificationId);

    notificationsRef.set({
      id: notificationId,
      info: {
        type: "paid",
        keyword: ""
      },
      from: uid,
      to: post.user.uid,
      isSeen: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
      postId: postId,
      commentId: ""
    });
  });

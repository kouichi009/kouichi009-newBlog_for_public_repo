const functions = require("firebase-functions");
const admin = require("firebase-admin");
const export_api = require("../helper/api");

const NOTIFICATIONS = "notifications";

exports.onNotificationComment = functions.firestore
  .document("posts/{postId}/comments/{commentId}")
  .onCreate(async (snapshot, context) => {
    const comment = snapshot.data();
    const postId = context.params.postId;
    const post = await export_api.fetchPost(postId);
    const notification = await fetchCommentNotification(comment, post);
    // if (post.user.uid === comment.user.uid) {
    //   console.log(
    //     "same user comment 3333333333333 @!!!!!!!!!!!!!@@@@@@@@@@@@@@@@"
    //   );
    //   return;
    // }
    // console.log(
    //   "same user comment 444444444444444444 @!!!!!!!!!!!!!@@@@@@@@@@@@@@@@"
    // );
    if (notification) {
      updateNotificationComment(post.user.uid, notification.id);
    } else {
      createNotificationComment(post, comment);
    }
  });

async function fetchCommentNotification(comment, post) {
  const docRef = admin
    .firestore()
    .collection("users")
    .doc(post.user.uid)
    .collection(NOTIFICATIONS)
    .where("type", "==", "comment")
    .where("postId", "==", post.id)
    .where("uid", "==", post.user.uid);

  const notificationQuerySnapshot = await docRef.get();

  var notification = null;
  notificationQuerySnapshot.docs.map(doc => {
    notification = doc.data();
  });
  return notification;
}

async function createNotificationComment(post, comment) {
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

  notificationsRef
    .set({
      id: notificationId,
      info: {
        type: "comment",
        keyword: ""
      },
      from: comment.user.uid,
      to: post.user.uid,
      isSeen: false,
      postId: post.id,
      commentId: comment.id,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null
    })
    .then(function() {})
    .catch(function(error) {});
}

async function updateNotificationComment(uid, id) {
  const timestamp = admin.firestore.FieldValue.serverTimestamp();

  const docRef = admin
    .firestore()
    .collection("users")
    .doc(uid)
    .collection(NOTIFICATIONS)
    .doc(id);

  let notificationComment = {
    isSeen: false
  };
  docRef
    .update(notificationComment)
    .then(function() {})
    .catch(function(error) {});
}

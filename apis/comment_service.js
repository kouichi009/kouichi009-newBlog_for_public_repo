import { db, firebase } from "~/plugins/firebase";
import { UPDATED_AT, DESC, ApiService } from "~/apis/constant_type";

export const CommentService = {
  async query(postId) {
    const commentsCollection = await db
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .where("status", "==", 1)
      .orderBy(UPDATED_AT, DESC)
      .limit(3);

    const commentsQuerySnapshot = await commentsCollection.get();

    let returnObj = {
      comments: [],
      lastVisible: null,
      isEmpty: false
    };
    if (commentsQuerySnapshot.empty) {
      returnObj.isEmpty = true;
      return returnObj;
    }

    returnObj.lastVisible =
      commentsQuerySnapshot.docs[commentsQuerySnapshot.docs.length - 1];

    var comments = [];
    await Promise.all(
      commentsQuerySnapshot.docs.map(async doc => {
        var comment = doc.data();
        const date = ApiService.getDate(comment.updatedAt);
        comment.date = date;
        comments.push(comment);
      })
    );
    returnObj.comments = comments;
    return returnObj;
  },

  async queryMore(postId, comments, lastVisible) {
    const commentsCollection = await db
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .where("status", "==", 1)
      .orderBy(UPDATED_AT, DESC)
      .startAfter(lastVisible)
      .limit(3);

    const commentsQuerySnapshot = await commentsCollection.get();

    var returnObj = {
      comments: comments,
      lastVisible: null,
      isEmpty: false
    };

    if (commentsQuerySnapshot.empty) {
      returnObj.isEmpty = true;
      return returnObj;
    }
    returnObj.lastVisible =
      commentsQuerySnapshot.docs[commentsQuerySnapshot.docs.length - 1];

    var newComments = [];
    await Promise.all(
      commentsQuerySnapshot.docs.map(async doc => {
        var comment = doc.data();
        const date = ApiService.getDate(comment.updatedAt);
        comment.date = date;
        newComments.push(comment);
      })
    );
    returnObj.comments = returnObj.comments.concat(newComments);
    return returnObj;
  },

  async create(comment) {
    let batch = db.batch();
    const postId = String(comment.postId);
    let postsCollection = db.collection("posts").doc(postId);
    batch.update(postsCollection, {
      commentCount: firebase.firestore.FieldValue.increment(1)
    });

    let commentsCollection = db
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .doc(comment.id);

    batch.set(commentsCollection, comment);

    let userComment = {
      commentId: comment.id,
      postId: postId,
      status: 1,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      deletedAt: null,
      uid: comment.user.uid
    };
    let usersCollection = db
      .collection("users")
      .doc(comment.user.uid)
      .collection("userComments")
      .doc(comment.id);

    batch.set(usersCollection, userComment);
    return await batch.commit();
  },

  async destroy(comment, post) {
    let batch = db.batch();
    const postId = String(post.id);
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();

    let postsCollection = db.collection("posts").doc(postId);
    batch.update(postsCollection, {
      commentCount: firebase.firestore.FieldValue.increment(-1)
    });

    let commentsCollection = db
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .doc(comment.id);

    batch.update(commentsCollection, {
      deletedAt: timestamp,
      status: 2
    });

    let usersCollection = db
      .collection("users")
      .doc(comment.user.uid)
      .collection("userComments")
      .doc(comment.id);

    batch.update(usersCollection, {
      deletedAt: timestamp,
      status: 2
    });

    return await batch.commit();
  },

  async getCommentNotification(commentId, postUid) {
    const notificationsCollection = db
      .collection("users")
      .doc(postUid)
      .collection("notifications")
      .where("comment.id", "==", commentId);
    let notificationsQuerySnapshot = await notificationsCollection.get();
    console.log(notificationsQuerySnapshot.size);
    var notification = null;
    notificationsQuerySnapshot.docs.map(async doc => {
      notification = doc.data();
    });
    return notification;
  },

  async queryMyComments(currentUid) {
    const userCommentsCollection = await db
      .collection("users")
      .doc(currentUid)
      .collection("userComments");

    const userCommentsQuerySnapshot = await userCommentsCollection.get();

    var comments = [];
    userCommentsQuerySnapshot.docs.map(async doc => {
      let commentId = doc.data().commentId;
      let postId = doc.data().postId;
      let commentDocRef = await db
        .collection("posts")
        .doc(postId)
        .collection("comments")
        .doc(commentId)
        .get();

      let comment = commentDocRef.data();

      comments.push(comment);
    });
    return comments;
  },

  async getCommentFromId(postId, commentId) {
    // return;
    const commentDoc = await db
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .doc(commentId)
      .get();
    if (commentDoc.exists) {
      return commentDoc.data();
    }
    return null;
  }
};

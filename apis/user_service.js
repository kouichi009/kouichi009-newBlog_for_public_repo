import { db, firebase } from "~/plugins/firebase";
import { UPDATED_AT, DESC, ApiService } from "~/apis/constant_type";
import { PostService } from "~/apis/post_service";

export const UserService = {
  async fetchUser(username) {
    var user = null;

    var usersCollection = db
      .collection("users")
      .where("username", "==", username)
      .where("status", "==", 1)
      .limit(1);

    const snapshot = await usersCollection.get();
    console.log(snapshot.size);

    snapshot.forEach(function(doc) {
      user = doc.data();
    });

    return user;
  },

  async getUserFromUid(uid) {
    var usersCollection = db.collection("users").doc(uid);
    const userDoc = await usersCollection.get();
    const user = userDoc.data();
    return user;
  },
  async query(user, currentUid) {
    let postsCollection = db
      .collection("posts")
      .where("user.uid", "==", user.uid)
      .where("status", "==", 1)
      .orderBy(UPDATED_AT, DESC)
      .limit(3);

    const postsQuerySnapshot = await postsCollection.get();
    const returnObj = await PostService.queryPostsCollection(
      postsQuerySnapshot,
      currentUid,
      null,
      false
    );

    return returnObj;
  },
  async queryMore(user, currentUid, lastVisible, posts) {
    var postsCollection = db
      .collection("posts")
      .where("user.uid", "==", user.uid)
      .where("status", "==", 1)
      .orderBy(UPDATED_AT, DESC)
      .startAfter(lastVisible)
      .limit(3);
    const postsQuerySnapshot = await postsCollection.get();

    const returnObj = await PostService.queryPostsCollection(
      postsQuerySnapshot,
      currentUid,
      posts,
      false
    );

    return returnObj;
  },

  async queryLikedPosts(uid, currentUid) {
    let postsCollection = db
      .collection("users")
      .doc(uid)
      .collection("likedPosts")
      .where("isLiked", "==", true)
      .where("status", "==", 1)
      .orderBy(UPDATED_AT, DESC)
      .limit(3);

    const postsQuerySnapshot = await postsCollection.get();
    const returnObj = await PostService.queryPostsCollection(
      postsQuerySnapshot,
      currentUid,
      null,
      true
    );

    return returnObj;
  },

  async queryLikedPostsMore(uid, currentUid, lastVisible, posts) {
    let postsCollection = db
      .collection("users")
      .doc(uid)
      .collection("likedPosts")
      .where("isLiked", "==", true)
      .where("status", "==", 1)
      .orderBy(UPDATED_AT, DESC)
      .startAfter(lastVisible)
      .limit(3);

    const postsQuerySnapshot = await postsCollection.get();

    const returnObj = await PostService.queryPostsCollection(
      postsQuerySnapshot,
      currentUid,
      posts,
      true
    );

    return returnObj;
  },

  async queryPaidPosts(currentUid) {
    let postsCollection = db
      .collection("users")
      .doc(currentUid)
      .collection("paidPosts")
      .orderBy(UPDATED_AT, DESC)
      .limit(3);

    const postsQuerySnapshot = await postsCollection.get();
    const returnObj = await PostService.queryPostsCollection(
      postsQuerySnapshot,
      currentUid,
      null,
      true
    );
    return returnObj;
  },

  async queryPaidPostsMore(currentUid, lastVisible, posts) {
    let postsCollection = db
      .collection("users")
      .doc(currentUid)
      .collection("paidPosts")
      .orderBy(UPDATED_AT, DESC)
      .startAfter(lastVisible)
      .limit(3);

    const postsQuerySnapshot = await postsCollection.get();
    const returnObj = await PostService.queryPostsCollection(
      postsQuerySnapshot,
      currentUid,
      posts,
      true
    );

    return returnObj;
  },

  async getDraftPosts(currentUid) {
    console.log("getDraftPosts ", currentUid);
    //
    let postsCollection = db
      .collectionGroup("editingPost")
      .where("uid", "==", currentUid)
      .where("status", "==", 0)
      .orderBy(UPDATED_AT, DESC);

    const postsQuerySnapshot = await postsCollection.get();

    var posts = [];
    await Promise.all(
      postsQuerySnapshot.docs.map(async doc => {
        var post = doc.data();
        const date = ApiService.getDate(post.updatedAt);
        post.date = "Last edited on " + date;
        posts.push(post);
      })
    );
    return posts;
  },
  async getPublicPosts(currentUid) {
    let postsCollection = db
      .collection("posts")
      .where("user.uid", "==", currentUid)
      .where("status", "==", 1)
      .orderBy(UPDATED_AT, DESC);

    const postsQuerySnapshot = await postsCollection.get();

    var posts = [];
    await Promise.all(
      postsQuerySnapshot.docs.map(async doc => {
        var post = doc.data();
        const date = ApiService.getDate(post.updatedAt);
        post.date = "Published on " + date;
        posts.push(post);
      })
    );
    return posts;
  }
};

import { db, firebase } from "~/plugins/firebase";

export const LikeService = {
  async add(post, currentUid) {
    let batch = db.batch();
    const postId = String(post.id);
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();

    let likesCollection = db
      .collection("posts")
      .doc(post.id)
      .collection("likes")
      .doc(currentUid);

    let likedPostsCollection = db
      .collection("users")
      .doc(currentUid)
      .collection("likedPosts")
      .doc(postId);

    if (!post.isLikedExist) {
      let likes = {
        uid: currentUid,
        isLiked: true,
        createdAt: timestamp,
        updatedAt: timestamp,
        deletedAt: null,
        postId: postId
      };
      batch.set(likesCollection, likes);

      let likedPost = {
        createdAt: timestamp,
        updatedAt: timestamp,
        deletedAt: null,
        postId: postId,
        isLiked: true,
        status: post.status,
        uid: currentUid
      };
      batch.set(likedPostsCollection, likedPost);
    } else {
      batch.update(likesCollection, {
        isLiked: true
      });

      batch.update(likedPostsCollection, {
        updatedAt: timestamp,
        isLiked: true
      });
    }

    let postsCollection = db.collection("posts").doc(post.id);
    batch.update(postsCollection, {
      likeCount: firebase.firestore.FieldValue.increment(1)
    });

    await batch.commit();
    post.isLiked = true;
    post.likeCount++;

    return post;
  },
  async remove(post, currentUid) {
    let batch = db.batch();
    const postId = String(post.id);
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();

    let likesCollection = db
      .collection("posts")
      .doc(post.id)
      .collection("likes")
      .doc(currentUid);

    let likes = {
      isLiked: false
    };
    batch.update(likesCollection, likes);

    let postsCollection = db.collection("posts").doc(post.id);
    batch.update(postsCollection, {
      likeCount: firebase.firestore.FieldValue.increment(-1)
    });

    let likedPost = {
      isLiked: false
    };

    let likedPosts = db
      .collection("users")
      .doc(currentUid)
      .collection("likedPosts")
      .doc(postId);
    batch.update(likedPosts, likedPost);

    await batch.commit();
    post.isLiked = false;
    post.likeCount--;

    return post;
  }
};

import { db, firebase } from "~/plugins/firebase";
import { UPDATED_AT, DESC, ApiService } from "~/apis/constant_type";
import { TransferService } from "~/apis/transfer_service";

export const PostService = {
  async query(currentUid) {
    var postsCollection = db
      .collection("posts")
      .where("status", "==", 1)
      .orderBy(UPDATED_AT, DESC)
      .limit(3);

    const postsQuerySnapshot = await postsCollection.get();
    console.log(postsQuerySnapshot.size);

    const returnObj = await this.queryPostsCollection(
      postsQuerySnapshot,
      currentUid,
      null,
      false
    );
    console.log("query : ", currentUid, returnObj, returnObj.lastVisible);
    return returnObj;
  },
  async queryMore(currentUid, lastVisible, posts) {
    var postsCollection = db
      .collection("posts")
      .where("status", "==", 1)
      .orderBy(UPDATED_AT, DESC)
      .startAfter(lastVisible)
      .limit(3);
    const postsQuerySnapshot = await postsCollection.get();
    const returnObj = await this.queryPostsCollection(
      postsQuerySnapshot,
      currentUid,
      posts,
      false
    );

    return returnObj;
  },
  async getEditingPost(postId) {
    const editingPostDoc = await db
      .collection("posts")
      .doc(postId)
      .collection("editingPost")
      .doc(postId)
      .get();
    console.log(
      editingPostDoc.empty,
      editingPostDoc.exists,
      editingPostDoc.exist
    );
    if (!editingPostDoc.exists) {
      return null;
    }
    let editingPost = editingPostDoc.data();
    editingPost.contents = editingPost.contents.filter(
      content => content.type !== "payline"
    );
    return editingPost;
  },
  async getPostFromId(postId) {
    var post = null;
    const postDoc = await db
      .collection("posts")
      .doc(postId)
      .get();
    post = postDoc.data();
    return post;
  },
  async get(slug, currentUid) {
    var docRef = await db
      .collection("posts")
      .where("slug", "==", slug)
      // .where("status", "==", 1)
      .get();

    var post = null;
    await Promise.all(
      docRef.docs.map(async doc => {
        post = doc.data();

        var isPaid = false;
        var isLiked = false;

        if (currentUid) {
          isPaid = await this.getIsPaid(post, currentUid);
          let { isLikedBool, isLikedExist } = await this.getIsLiked(
            post,
            currentUid
          );
          isLiked = isLikedBool;
        }

        const [isPaidResponse, isLikedResponse] = await Promise.all([
          isPaid,
          isLiked
        ]);

        post.isPaid = isPaidResponse;
        post.isLiked = isLikedResponse;

        let { contents, afterPaylineWordsCount } = this.setPaylineForDetailPost(
          post,
          currentUid
        );
        post.contents = contents;
        post.afterPaylineWordsCount = afterPaylineWordsCount;

        const date = ApiService.getDate(post.updatedAt);
        post.date = date;

        // 購入してなくて、削除済みであれば、postにnullを代入する。404 not foundに。
        if (!isPaidResponse && post.status === 2) {
          post = null;
        }
      })
    );

    return post;
  },

  async create(post) {
    var newPost = Object.assign({}, post);

    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    newPost.createdAt = timestamp;
    newPost.updatedAt = timestamp;
    let batch = db.batch();
    const postId = String(newPost.id);

    let postsCollection = db.collection("posts").doc(postId);
    batch.set(postsCollection, newPost);

    let editingPost = {
      status: post.status,
      updatedAt: timestamp
    };

    let editingPostCollection = db
      .collection("posts")
      .doc(postId)
      .collection("editingPost")
      .doc(postId);

    batch.update(editingPostCollection, editingPost);

    await batch.commit();
    return newPost;
  },
  async updatePost(post, postId) {
    console.log(post, postId);

    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    post.updatedAt = timestamp;
    let batch = db.batch();

    let postsCollection = db.collection("posts").doc(postId);
    batch.update(postsCollection, post);

    await batch.commit();

    return post;
  },

  setEditingPost(post) {
    var paylineIndex = -1;
    if (post.isToll) {
      paylineIndex = 2;
    }
    // すでにPostしたのを編集したのを保存するためのノード。
    let editingPost = {
      //editingpostには、このラインより上の文言は消す。
      id: post.id,
      title: post.title,
      contents: post.contents,
      headerImage: post.headerImage,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      deletedAt: null,
      status: post.status,
      uid: post.user.uid
    };
    return editingPost;
  },

  async createEditingPost(editingPost) {
    var newEditingPost = Object.assign({}, editingPost);
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    let batch = db.batch();
    const postId = newEditingPost.id;
    newEditingPost.createdAt = timestamp;
    newEditingPost.updatedAt = timestamp;

    // すでにPostしたのを編集したのを保存するためのノード。
    let editingPostCollection = db
      .collection("posts")
      .doc(postId)
      .collection("editingPost")
      .doc(postId);

    batch.set(editingPostCollection, newEditingPost);

    await batch.commit();

    return newEditingPost;
  },

  async updateEditingPost(editingPost) {
    //  var newPost = Object.assign({}, post);
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    //  newPost.updatedAt = timestamp;
    let batch = db.batch();
    const postId = String(editingPost.id);

    editingPost.updatedAt = timestamp;

    // すでにPostしたのを編集したのを保存するためのノード。
    let editingPostCollection = db
      .collection("posts")
      .doc(postId)
      .collection("editingPost")
      .doc(postId);

    batch.update(editingPostCollection, editingPost);

    await batch.commit();
    return editingPost;
  },
  async createPaidPosts(post, currentUid) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    let batch = db.batch();
    const postId = String(post.id);

    let paidUsersCollection = db
      .collection("posts")
      .doc(postId)
      .collection("paid")
      .doc(currentUid);

    var paid = {
      postId: postId,
      uid: currentUid,
      isPaid: true,
      paidPrice: Number(post.price),
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null
    };
    batch.set(paidUsersCollection, paid);

    let postsCollection = db.collection("posts").doc(postId);
    batch.update(postsCollection, {
      paidCount: firebase.firestore.FieldValue.increment(1)
    });

    let usersPaidPostsCollection = db
      .collection("users")
      .doc(currentUid)
      .collection("paidPosts")
      .doc(postId);

    batch.set(usersPaidPostsCollection, paid);
    await TransferService.create(batch, post, currentUid);
    batch.commit().then(function() {});
  },

  async delete(post) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    let batch = db.batch();
    const postId = String(post.id);

    let postsCollection = db.collection("posts").doc(postId);
    batch.update(postsCollection, {
      deletedAt: timestamp,
      status: 2
    });

    const editingPostCollection = await db
      .collection("posts")
      .doc(postId)
      .collection("editingPost")
      .doc(postId);

    batch.update(editingPostCollection, {
      deletedAt: timestamp,
      status: 2
    });

    let uids = await this.fetchPostLikes(post);

    uids.forEach(uid => {
      const usersLikedPostsCollection = db
        .collection("users")
        .doc(uid)
        .collection("likedPosts")
        .doc(post.id);
      batch.update(usersLikedPostsCollection, {
        deletedAt: timestamp,
        status: 2
      });
    });

    await batch.commit();
  },

  async deleteEditingPost(post) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    let batch = db.batch();
    const postId = String(post.id);

    let editingPostCollection = db
      .collection("posts")
      .doc(postId)
      .collection("editingPost")
      .doc(postId);

    batch.update(editingPostCollection, {
      deletedAt: timestamp,
      status: 2
    });

    await batch.commit();
    console.log("delete editingPost batch commit!", post);
  },

  async fetchPostLikes(post) {
    let postLikesCollection = db
      .collection("posts")
      .doc(post.id)
      .collection("likes");
    let postLikesQuerySnapshot = await postLikesCollection.get();
    var uids = [];
    postLikesQuerySnapshot.docs.map(async doc => {
      uids.push(doc.data().uid);
    });
    return uids;
  },

  async fetchNotifications(post) {
    const notificationsCollection = db
      .collection("users")
      .doc(post.user.uid)
      .collection("notifications")
      .where("post.id", "==", post.id);
    let notificationsQuerySnapshot = await notificationsCollection.get();
    var notifications = [];
    notificationsQuerySnapshot.docs.map(async doc => {
      console.log(doc.data());

      notifications.push(doc.data());
    });
    return notifications;
  },

  async queryPostsCollection(snapshot, currentUid, posts, isGetFromPostId) {
    var addPostsFlg = false;
    if (posts) {
      addPostsFlg = true;
    }

    let returnObj = {
      posts: posts,
      lastVisible: null,
      isEmpty: false
    };
    if (snapshot.empty) {
      returnObj.isEmpty = true;
      return returnObj;
    }

    returnObj.lastVisible = snapshot.docs[snapshot.docs.length - 1];

    var newPosts = [];
    await Promise.all(
      snapshot.docs.map(async doc => {
        var post = null;
        if (isGetFromPostId) {
          let postId = doc.data().postId;
          post = await PostService.getPostFromId(postId);
        } else {
          post = doc.data();
        }

        var isPaid = false;
        var isLiked = false;

        if (currentUid) {
          isPaid = await this.getIsPaid(post, currentUid);

          let { isLikedBool, isLikedExist } = await this.getIsLiked(
            post,
            currentUid
          );
          isLiked = isLikedBool;

          const [isPaidResponse, isLikedResponse] = await Promise.all([
            isPaid,
            isLiked
          ]);
          post.isPaid = isPaidResponse;
          post.isLiked = isLikedResponse;
        }

        post = this.setPayline(post);

        const date = ApiService.getDate(post.updatedAt);
        post.date = date;

        newPosts.push(post);
      })
    );
    if (!addPostsFlg) {
      returnObj.posts = newPosts;
    } else {
      returnObj.posts = returnObj.posts.concat(newPosts);
    }
    return returnObj;
  },
  setPayline(post) {
    var shortContent = "";
    //有料
    if (post.contents && post.isToll === true) {
      for (var i = 0; i < post.contents.length; i++) {
        if (i === post.paylineIndex) {
          break;
        }
        switch (post.contents[i].type) {
          case "H3":
          case "TEXT":
          case "BLOCKQUOTE":
            let removedHtmlWords = this.removeHtml(post.contents[i].data);
            shortContent = shortContent + removedHtmlWords;

            break;
          default:
            console.log("それ以外よんだよ。 @@@@@@@@@@@@@@@@@@");
            break;
        }
      }
    } else {
      // 無料の記事であれば
      for (var i = 0; i < post.contents.length; i++) {
        // console.log(
        //   "post.contents[i]: ",
        //   post.contents[i],
        //   i,
        //   post.contents.length
        // );
        // return;
        switch (post.contents[i].type) {
          case "H3":
          case "TEXT":
          case "BLOCKQUOTE":
            let removedHtmlWords = this.removeHtml(post.contents[i].data);
            // console.log("removedHtmlWords: ", removedHtmlWords);
            shortContent = shortContent + removedHtmlWords;

            break;
          default:
            console.log("それ以外よんだよ。 @@@@@@@@@@@@@@@@@@");
            break;
        }
      }
    }
    post.shortContent = this.shorten(shortContent, 500);

    return post;
  },
  shorten(str, maxLen, separator = " ") {
    str = str.replace(/&nbsp;/gi, "");
    if (str.length <= maxLen) return str;
    return str.substr(0, str.lastIndexOf(separator, maxLen));
  },
  setPaylineForDetailPost(post, currentUid) {
    var contents = [];
    var afterPaylineWordsCount = 0;

    //購入済みであれば、
    if (post.isPaid) {
      contents = post.contents;
    }
    //有料だけど、未購入
    else if (
      (post.contents && post.isToll === true && !currentUid) ||
      (post.contents && post.isToll === true && post.user.uid !== currentUid)
    ) {
      var reachPaylineFlg = false;
      for (var i = 0; i < post.contents.length; i++) {
        if (i === post.paylineIndex) {
          reachPaylineFlg = true;
        }
        if (!reachPaylineFlg) {
          contents.push(post.contents[i]);
        } else {
          switch (post.contents[i].type) {
            case "H3":
            case "TEXT":
            case "BLOCKQUOTE":
            case "PRE":
              if (post.contents[i].data) {
                let removedHtmlWords = this.removeHtml(post.contents[i].data);
                let wordsCount = removedHtmlWords.split(" ").length;

                afterPaylineWordsCount = afterPaylineWordsCount + wordsCount;
              }
              break;
            default:
              console.log("それ以外よんだよ。 @@@@@@@@@@@@@@@@@@");
              break;
          }
        }
      }
    } else {
      // 無料の記事もしくは、自分の投稿であれば
      contents = post.contents;
    }
    return { contents, afterPaylineWordsCount };
  },
  async getIsPaid(post, currentUid) {
    const paidDoc = await db
      .collection("posts")
      .doc(post.id)
      .collection("paid")
      .doc(currentUid)
      .get();
    var isPaid = false;
    console.log(paidDoc);
    console.log(paidDoc.exists);

    if (paidDoc.exists) {
      isPaid = paidDoc.data().isPaid;
    }
    return isPaid;
  },

  async getIsLiked(post, currentUid) {
    const LikesDoc = await db
      .collection("posts")
      .doc(post.id)
      .collection("likes")
      .doc(currentUid)
      .get();
    var isLikedBool = false;
    var isLikedExist = false;
    console.log(LikesDoc);
    console.log(LikesDoc.exists);

    if (LikesDoc.exists) {
      isLikedBool = LikesDoc.data().isLiked;
      isLikedExist = true;
    }

    return { isLikedBool, isLikedExist };
  },

  async queryMyPosts(currentUid) {
    const postsCollection = await db
      .collection("posts")
      .where("user.uid", "==", currentUid);

    const postsQuerySnapshot = await postsCollection.get();

    var posts = [];
    postsQuerySnapshot.docs.map(async doc => {
      let post = doc.data();

      posts.push(post);
    });
    return posts;
  },
  removeHtml(content) {
    let removedHtmlWords = content.replace(/<[^>]*>?/gm, "");
    return removedHtmlWords;
  }
};

export const TagService = {
  async query(currentUid, tag) {
    var postsCollection = db
      .collection("posts")
      .where("status", "==", 1)
      .where("tags", "array-contains", tag)
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
  async queryMore(currentUid, lastVisible, tag, posts) {
    var postsCollection = db
      .collection("posts")
      .where("status", "==", 1)
      .where("tags", "array-contains", tag)
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
  }
};

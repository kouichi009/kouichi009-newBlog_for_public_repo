import { db, firebase } from "~/plugins/firebase";
import { ApiService, MAGICLINK } from "./constant_type";
import { UserService } from "~/apis/user_service";
import { CommentService } from "~/apis/comment_service";
import { PostService } from "./post_service";

export const AuthService = {
  async sendMagicLink(email) {
    var actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be whitelisted in the Firebase Console.
      url: process.env.EMAIL_AUTH_CALLBACK_URL,
      handleCodeInApp: true
    };
    await firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings);
    window.localStorage.setItem(MAGICLINK, email);
    return;
  },

  async signInWithEmailLink(url) {
    var returnObj = {
      user: null,
      loginAction: false
    };
    if (firebase.auth().isSignInWithEmailLink(url)) {
      var email = window.localStorage.getItem(MAGICLINK);
      if (!email) {
        email = window.prompt("Please provide your email for confirmation");
      }
      let response = await firebase.auth().signInWithEmailLink(email, url);
      window.localStorage.removeItem(MAGICLINK);

      const uid = response.user.uid;

      returnObj.user = await UserService.getUserFromUid(uid);
      if (!returnObj.user) {
        const usernames = response.user.email.split("@");
        const name = usernames[0];
        const photoURL =
          "https://miro.medium.com/max/720/1*W35QUSvGpcLuxPo3SRTH4w.png";
        const newusername = await this.checkAndChangeOverlapUsername(
          uid,
          usernames[0],
          ""
        );

        let { userModel, privateInfoModel } = this.getUserModel(
          name,
          email,
          photoURL,
          uid,
          newusername,
          "email"
        );
        returnObj.user = userModel;
        await this.createDBUsers(newusername, userModel, privateInfoModel);
      } else {
        returnObj.loginAction = true;
      }
    }
    return returnObj;
  },

  async loginGoogle() {
    var user = null;
    console.log("login Google");

    let response = await firebase
      .auth()
      .signInWithPopup(new firebase.auth.GoogleAuthProvider());

    const authCurrentUser = response.user;
    console.log(response);
    console.log(response.user);
    console.log(response.user.displayName);
    console.log(response.user.email);
    console.log(response.user.photoURL);

    const usernames = response.user.email.split("@");

    user = await UserService.getUserFromUid(authCurrentUser.uid);

    if (!user) {
      const newusername = await this.checkAndChangeOverlapUsername(
        authCurrentUser.uid,
        usernames[0],
        ""
      );

      let { userModel, privateInfoModel } = this.getUserModel(
        authCurrentUser.displayName,
        authCurrentUser.email,
        authCurrentUser.photoURL,
        authCurrentUser.uid,
        newusername,
        "google"
      );

      user = userModel;
      await this.createDBUsers(newusername, userModel, privateInfoModel);
    }
    return authCurrentUser;
  },

  getUserModel(name, email, profileImageUrl, uid, username, type) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    const userModel = {
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
      name: name,
      profileImageUrl: profileImageUrl,
      status: 1,
      uid: uid,
      username: username,
      description: ""
    };

    const privateInfoModel = {
      stripeInfo: {
        customerId: "",
        last4: "",
        month: null,
        year: null,
        name: "",
        brand: ""
      },
      address: {
        country: "",
        city: "",
        address: "",
        postalCode: "",
        state: ""
      },
      bank: {
        country: "",
        swiftCode: "",
        accountNumber: "",
        accountType: "",
        holderName: ""
      },
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
      transferMoneyNotifyEmail: email,
      signUpEmail: email,
      signUpType: type,
      uid: uid
    };
    return { userModel, privateInfoModel };
  },

  async updateUsername(refCurrentUser, username) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    let batch = db.batch();

    let currentUsername = refCurrentUser.username;

    const currentUsernamesCollection = db
      .collection("users")
      .doc(refCurrentUser.uid)
      .collection("usernameCollection")
      .doc(currentUsername.toLowerCase());
    batch.delete(currentUsernamesCollection);

    const newUsernamesCollection = db
      .collection("users")
      .doc(refCurrentUser.uid)
      .collection("usernameCollection")
      .doc(username.toLowerCase());
    batch.set(newUsernamesCollection, {
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
      status: 1,
      uid: refCurrentUser.uid,
      username: username.toLowerCase()
    });

    const usersCollection = db.collection("users").doc(refCurrentUser.uid);
    batch.update(usersCollection, {
      username: username
    });
    ///////////////////////////////////////////////////////////////////
    let comments = await CommentService.queryMyComments(refCurrentUser.uid);
    let posts = await PostService.queryMyPosts(refCurrentUser.uid);

    posts.forEach(post => {
      if (!post) {
        return;
      }
      const postsCollection = db.collection("posts").doc(post.id);
      batch.update(postsCollection, {
        "user.username": username
        // user: userObj
      });
    });

    comments.forEach(comment => {
      if (!comment) {
        return;
      }

      const commentsCollection = db
        .collection("posts")
        .doc(comment.postId)
        .collection("comments")
        .doc(comment.id);
      batch.update(commentsCollection, {
        "user.username": username
      });
    });

    await batch.commit();
    return;
  },

  async updateUser(refCurrentUser, authCurrentUser) {
    let batch = db.batch();
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    let comments = await CommentService.queryMyComments(refCurrentUser.uid);
    let posts = await PostService.queryMyPosts(refCurrentUser.uid);

    let userObj = {
      profileImageUrl: refCurrentUser.profileImageUrl,
      username: refCurrentUser.username,
      uid: refCurrentUser.uid,
      name: refCurrentUser.name
    };

    posts.forEach(post => {
      if (!post) {
        return;
      }
      const postsCollection = db.collection("posts").doc(post.id);
      batch.update(postsCollection, {
        user: userObj
      });
    });

    comments.forEach(comment => {
      if (!comment) {
        return;
      }
      const commentsCollection = db
        .collection("posts")
        .doc(comment.postId)
        .collection("comments")
        .doc(comment.id);
      batch.update(commentsCollection, {
        user: userObj
      });
    });

    const usersCollection = db.collection("users").doc(refCurrentUser.uid);

    batch.update(usersCollection, refCurrentUser);

    await batch.commit();
    console.log("11@@@@@@@@@@@@@@@@@@@@@@");
    await authCurrentUser.updateProfile({
      displayName: userObj.name,
      photoURL: userObj.profileImageUrl
    });
    console.log("33@@@@@@@@@@@@@@@@@@@@@@ ");

    return;
  },

  async checkAndChangeOverlapUsername(uid, username, shortId) {
    var newusername = username + shortId;
    newusername = newusername.toLowerCase();

    if (newusername.length < 3) {
      shortId = ApiService.makeId(4);
      newusername = await this.checkAndChangeOverlapUsername(
        uid,
        newusername,
        shortId
      );
      return newusername;
    } else if (newusername.length > 29) {
      newusername = newusername.substring(0, 20);
      newusername = await this.checkAndChangeOverlapUsername(
        uid,
        newusername,
        ""
      );
      return newusername;
    } else {
      const username_Ref = db
        .collectionGroup("usernameCollection")
        .where("username", "==", newusername);
      var isAvailable = false;
      const snap = await username_Ref.get();

      if (snap.empty) {
        // 使用可能なIDです。
        isAvailable = true;
      } else {
        //同じusernameがすでに存在する
        isAvailable = false;
      }

      if (!isAvailable) {
        shortId = ApiService.makeId(4);
        newusername = await this.checkAndChangeOverlapUsername(
          uid,
          username,
          shortId
        );
      }
      return newusername;
    }
  },
  async checkOverlapUsername(uid, username) {
    username = username.toLowerCase();
    const username_Ref = db
      .collectionGroup("usernameCollection")
      .where("username", "==", username);

    var isAvailable = null;
    const snap = await username_Ref.get();

    if (snap.empty) {
      // 使用可能なIDです。
      isAvailable = true;
    } else {
      //同じusernameがすでに存在する
      isAvailable = false;
    }
    return isAvailable;
  },

  async createDBUsers(username, userModel, privateInfoModel) {
    let batch = db.batch();
    const timestamp = userModel.createdAt;
    let uid = userModel.uid;
    let usernameCollection = db
      .collection("users")
      .doc(uid)
      .collection("usernameCollection")
      .doc(username);
    batch.set(usernameCollection, {
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
      status: 1,
      username: username,
      uid: uid
    });

    let usersCollection = db.collection("users").doc(uid);
    batch.set(usersCollection, userModel);

    let usersPrivateCollection = db
      .collection("users")
      .doc(uid)
      .collection("privateInfo")
      .doc(uid);
    batch.set(usersPrivateCollection, privateInfoModel);

    const notificationId = db
      .collection("users")
      .doc(uid)
      .collection("notifications")
      .doc().id;
    const notificationsCollection = db
      .collection("users")
      .doc(uid)
      .collection("notifications")
      .doc(notificationId);

    let notification = {
      id: notificationId,
      info: {
        type: "admin",
        keyword: "welcome"
      },
      from: "",
      to: uid,
      isSeen: false,
      postId: "",
      commentId: "",
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null
    };
    batch.set(notificationsCollection, notification);

    await batch.commit();
    return;
  },

  async getCurrentUserPrivateInfo(currentUid) {
    const users_privateInfo_Ref = db
      .collection("users")
      .doc(currentUid)
      .collection("privateInfo")
      .doc(currentUid);
    const docPrivateRef = await users_privateInfo_Ref.get();
    let privateInfo = docPrivateRef.data();
    return privateInfo;
  },

  async registerCreditCard(privateInfo, card) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    let batch = db.batch();

    const usersPrivateInfoCollection = db
      .collection("users")
      .doc(privateInfo.uid)
      .collection("privateInfo")
      .doc(privateInfo.uid);

    const stripeInfo = {
      brand: card.brand,
      last4: card.last4,
      year: card.exp_year,
      month: card.exp_month,
      customerId: card.customer,
      name: ""
    };

    batch.update(usersPrivateInfoCollection, {
      stripeInfo: stripeInfo
    });

    await batch.commit();

    return stripeInfo;
  },

  async deleteCreditCard(privateInfo) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    let batch = db.batch();

    const usersPrivateInfoCollection = db
      .collection("users")
      .doc(privateInfo.uid)
      .collection("privateInfo")
      .doc(privateInfo.uid);

    const stripeInfo = {
      customerId: privateInfo.stripeInfo.customerId,
      brand: "",
      last4: "",
      month: null,
      year: null,
      name: ""
    };

    batch.update(usersPrivateInfoCollection, {
      stripeInfo: stripeInfo
    });

    await batch.commit();

    return stripeInfo;
  },

  async registerAddressAndBank(privateInfo, address, bank) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    let batch = db.batch();

    const usersPrivateCollection = db
      .collection("users")
      .doc(privateInfo.uid)
      .collection("privateInfo")
      .doc(privateInfo.uid);
    batch.update(usersPrivateCollection, {
      address: address,
      bank: bank
    });

    await batch.commit();

    return;
  },
  async deleteAddressAndBank(privateInfo, address, bank) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    let batch = db.batch();

    const usersPrivateCollection = db
      .collection("users")
      .doc(privateInfo.uid)
      .collection("privateInfo")
      .doc(privateInfo.uid);
    batch.update(usersPrivateCollection, {
      address: address,
      bank: bank
    });

    await batch.commit();

    return;
  },

  async getAuthCurrentUser() {
    let currentUser = firebase.auth().currentUser;
    if (currentUser) {
      console.log("getCurrentUser 1: ", currentUser.uid);

      return currentUser;
    }
    currentUser = await this.onAuthStateChanged();
    console.log("getCurrentUser 2: ", currentUser);

    return currentUser;
  },

  onAuthStateChanged() {
    return new Promise(async (resolve, reject) => {
      let unsubscribe = firebase.auth().onAuthStateChanged(async user => {
        // user オブジェクトを resolve
        resolve(user);

        // 登録解除
        unsubscribe();
      });
    });
  },
  async signOut() {
    console.log("logout 2");
    await firebase.auth().signOut();
    console.log("logout 2.5");

    return;
  }
};

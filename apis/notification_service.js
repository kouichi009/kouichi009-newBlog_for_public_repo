import { db, firebase } from "~/plugins/firebase";
import { UPDATED_AT, DESC, ApiService } from "~/apis/constant_type";
import { PostService } from "~/apis/post_service";
import { UserService } from "~/apis/user_service";
import { CommentService } from "~/apis/comment_service";

const NOTIFICATIONS = "notifications";

export const NotificationService = {
  async query(currentUid) {
    const docRef = db
      .collection("users")
      .doc(currentUid)
      .collection(NOTIFICATIONS)
      .orderBy(UPDATED_AT, DESC)
      .limit(5);

    const notificationsQuerySnapshot = await docRef.get();
    const returnObj = await this.queryNotificationsCollection(
      notificationsQuerySnapshot,
      null
    );

    return returnObj;
  },
  async queryMore(currentUid, lastVisible, notifications) {
    var docRef = db
      .collection("users")
      .doc(currentUid)
      .collection(NOTIFICATIONS)
      .orderBy(UPDATED_AT, DESC)
      .startAfter(lastVisible)
      .limit(5);

    const notificationsQuerySnapshot = await docRef.get();
    const returnObj = await this.queryNotificationsCollection(
      notificationsQuerySnapshot,
      notifications
    );
    return returnObj;
  },

  async queryNotificationsCollection(snapshot, notifications) {
    var addNotificationsFlg = false;
    if (notifications) {
      addNotificationsFlg = true;
    }

    let returnObj = {
      notifications: notifications,
      lastVisible: null,
      isEmpty: false
    };
    if (snapshot.empty) {
      returnObj.isEmpty = true;
      return returnObj;
    }

    returnObj.lastVisible = snapshot.docs[snapshot.docs.length - 1];

    var newNotifications = [];
    await Promise.all(
      snapshot.docs.map(async doc => {
        var notification = doc.data();

        if (
          notification.info.type === "like" ||
          notification.info.type === "comment" ||
          notification.info.type === "paid"
        ) {
          if (notification.info.type === "like") {
            notification.message = "liked for";
          } else if (notification.info.type === "comment") {
            notification.message = "commented for";
          } else if (notification.info.type === "paid") {
            notification.message = "paid for";
          }
          const date = ApiService.getDate(notification.updatedAt);
          notification.date = date;

          var post = await PostService.getPostFromId(notification.postId);
          var user = await UserService.getUserFromUid(notification.from);
          var comment = null;

          if (notification.info.type === "comment") {
            comment = await CommentService.getCommentFromId(
              notification.postId,
              notification.commentId
            );
          }
          notification.post = post;
          notification.user = user;
          notification.comment = comment;
        } else if (notification.info.type === "admin") {
          if (notification.info.keyword === "welcome") {
            notification.message = "welcome to Publista 2";
          }
        }

        newNotifications.push(notification);
      })
    );
    newNotifications = newNotifications.sort(function(a, b) {
      return b.updatedAt.seconds - a.updatedAt.seconds;
    });
    if (!addNotificationsFlg) {
      returnObj.notifications = newNotifications;
    } else {
      returnObj.notifications = returnObj.notifications.concat(
        newNotifications
      );
    }
    return returnObj;
  },

  async getBadgeCount(currentUid) {
    const notificatinsCollection = db
      .collection("users")
      .doc(currentUid)
      .collection(NOTIFICATIONS)
      .where("isSeen", "==", false);

    const snapshot = await notificatinsCollection.get();
    let badgeCount = snapshot.size;

    return badgeCount;
  },
  async resetBadge(currentUid) {
    const notificatinsCollection = db
      .collection("users")
      .doc(currentUid)
      .collection(NOTIFICATIONS)
      .where("isSeen", "==", false);

    const snapshot = await notificatinsCollection.get();

    snapshot.docs.map(async doc => {
      let notification = doc.data();
      const notificationsCollection = db
        .collection("users")
        .doc(currentUid)
        .collection(NOTIFICATIONS)
        .doc(notification.id);
      notificationsCollection.update({
        isSeen: true
      });
    });
  }
};

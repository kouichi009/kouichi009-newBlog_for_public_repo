<template>
  <div>
    <v-main>
      <div class="container ma-5">
        <button class="display-1" @click="newPost">
          new post クリックしてください。
        </button>
        <br />
        <br />
        <button class="display-1" @click="newEditPost">
          new Editing Post クリックしてください。
        </button>
        <br />
        <br />
        <button class="display-1" @click="newCommentAndNotification">
          newCommentAndNotification クリックしてください。
        </button>

        <br />
        <br />
        <div v-if="user">
          <p>{{ user.name }}</p>
          <p>{{ user.username }}</p>
          <p>{{ user.email }}</p>
          <p>{{ user.uid }}</p>
        </div>
      </div>
    </v-main>
  </div>
</template>

<script>
import { db, firebase } from "~/plugins/firebase";
import {
  REGISTER_ADDRESS_BANK,
  DELETE_ADDRESS_BANK
} from "~/store/actions_type";
import { UserService } from "~/apis/user_service";

export default {
  data() {
    return {};
  },
  mounted() {
    setTimeout(async () => {
      let currentUser = AuthService.getAuthCurrentUser();
    });
  },
  computed: {
    user() {
      let user = this.$store.getters["auth_module/user"];
      return user;
    }
  },
  methods: {
    async newPost() {
      let user = this.user;
      for (var i = 1; i < 12; i++) {
        // setTimeout(async () => {
        let batch = db.batch();
        console.log(user);
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        console.log("call here@");
        const postId = db.collection("posts").doc().id;
        let title = i + "_title";
        let contents = [
          {
            data: `<p name="first001" data-type="TEXT">${i}_content</p>`,
            type: "TEXT"
          }
        ];

        const post = {
          id: postId,
          title: title,
          slug: i + "_slug",
          createdAt: timestamp,
          updatedAt: timestamp,
          deletedAt: null,
          contents: contents,
          headerImage:
            "https://miro.medium.com/max/1000/1*6RJcIsuuGE07KkWGOI3o1Q.png",
          likeCount: 0,
          commentCount: 0,
          paidCount: 0,
          status: 1,
          isToll: false,
          tags: ["abc", "def"],
          price: 0,
          paylineIndex: -1,
          user: {
            profileImageUrl: user.profileImageUrl,
            username: user.username,
            name: user.name,
            uid: user.uid
          }
        };
        let editingPost = {
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
        console.log(post, editingPost);
        let postsCollection = db.collection("posts").doc(postId);
        batch.set(postsCollection, post);

        let editingPostsCollection = db
          .collection("posts")
          .doc(postId)
          .collection("editingPost")
          .doc(postId);
        batch.set(editingPostsCollection, editingPost);
        await batch.commit();
        // }, 1000);
      }
    },
    async newEditPost() {
      let user = this.user;
      for (var i = 1; i < 12; i++) {
        // setTimeout(async () => {
        let batch = db.batch();
        console.log(user);
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        console.log("call here@");
        const postId = db.collection("posts").doc().id;
        let title = i + "_title";
        let contents = [
          {
            content: i + "_content",
            data: {
              text: i + "_content"
            },
            type: "paragraph"
          }
        ];

        let editingPost = {
          id: postId,
          title: title,
          contents: contents,
          headerImage:
            "https://miro.medium.com/max/1000/1*6RJcIsuuGE07KkWGOI3o1Q.png",
          createdAt: timestamp,
          updatedAt: timestamp,
          deletedAt: null,
          status: 0,
          uid: user.uid
        };
        console.log(editingPost);

        let editingPostsCollection = db
          .collection("posts")
          .doc(postId)
          .collection("editingPost")
          .doc(postId);
        batch.set(editingPostsCollection, editingPost);
        await batch.commit();
      }
    },
    async newCommentAndNotification() {
      //
      let postId = "EhBcPavKtZMb7n6sSkLf";
      let postSlug = "0000000-g24wfxhg";
      let formUid = "v6y7SfUeZ9Vz95ozOdLzS1Dc1GG3";
      let toUid = "v6y7SfUeZ9Vz95ozOdLzS1Dc1GG3";
      for (var i = 1; i < 35; i++) {
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();

        let user = await UserService.getUserFromUid(formUid);
        const commentId = db.collection("comments").doc().id;

        var contents = [
          {
            type: "TEXT",
            data: i + "_comment"
          }
        ];
        //

        const comment = {
          id: commentId,
          slug: commentId,
          createdAt: timestamp,
          updatedAt: timestamp,
          deletedAt: null,
          contents: contents,
          status: 1,
          postId: postId,
          postSlug: postSlug,
          user: {
            uid: user.uid,
            profileImageUrl: user.profileImageUrl,
            username: user.username,
            name: user.name
          }
        };
        let batch = db.batch();
        //

        let commentsCollection = db
          .collection("posts")
          .doc(postId)
          .collection("comments")
          .doc(comment.id);

        batch.set(commentsCollection, comment);
        //

        let userComment = {
          commentId: comment.id,
          postId: postId,
          status: 1,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          deletedAt: null
        };
        let usersCollection = db
          .collection("users")
          .doc(comment.user.uid)
          .collection("userComments")
          .doc(comment.id);

        batch.set(usersCollection, userComment);

        const notificationId = db.collection("notifications").doc().id;

        let notification = {
          comment: { id: commentId, status: 1 },
          createdAt: timestamp,
          updatedAt: timestamp,
          deletedAt: null,
          from: formUid,
          to: toUid,
          id: notificationId,
          info: { keyword: "", type: "comment" },
          isSeen: false,
          post: { id: postId, status: 1 },
          to: toUid
        };
        let notificationsCollection = db
          .collection("users")
          .doc(toUid)
          .collection("notifications")
          .doc(notificationId);

        batch.set(notificationsCollection, notification);
        //
        console.log("coutn: ", i);
        await batch.commit();
      }
    }
  }
};
</script>

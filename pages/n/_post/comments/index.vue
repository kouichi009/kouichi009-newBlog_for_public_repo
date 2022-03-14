<template>
  <div class="grey lighten-5" style="min-height: 100%;">
    <nav-bar></nav-bar>
    <client-only>
      <dialog-error ref="dialogErrorRef"></dialog-error>
      <sign-up-in ref="signUpInRef"></sign-up-in>
    </client-only>
    <v-main>
      <div class="container-fluid px-5 py-2 mx-auto">
        <div class="py-5">
          <p>Showing Comments for:</p>
          <div v-if="post">
            <nuxt-link :to="`/n/${post.slug}`" style="text-decoration: none;">
              <v-card v-if="post" style="cursor: pointer">
                <div class="pa-5">
                  <p class="mb-1" style="font-weight: bold; font-size: 2.5rem;">
                    {{ post.title }}
                  </p>
                  <v-icon style="font-size: 2.5rem;">mdi-heart</v-icon>
                  <span style="font-size: 1.4rem">{{ post.likeCount }}</span>
                  <v-icon style="font-size: 2.5rem;" class="ml-3"
                    >mdi-comment-outline</v-icon
                  >
                  <span style="font-size: 1.4rem">{{ post.commentCount }}</span>
                </div>
              </v-card>
            </nuxt-link>
          </div>
          <div class="mt-10">
            <div v-if="user">
              <v-row>
                <v-avatar class="ml-3">
                  <img :src="user.profileImageUrl" alt="avatar" />
                </v-avatar>
                <p class="name">{{ user.name }}</p>
              </v-row>
              <resizable-textarea>
                <textarea
                  v-model="text"
                  rows="1"
                  placeholder="Write a comment..."
                ></textarea>
              </resizable-textarea>

              <v-btn
                class="mb-5 mt-5 text-capitalize send-btn"
                tile
                outlined
                color="success"
                @click="sendComment"
                height="5rem"
                >Send Comment</v-btn
              >
            </div>
            <div v-else>
              <p>
                You need to
                <span class="create-account-text" @click="createAccount"
                  >create an account</span
                >
                to post a comment.
              </p>
            </div>
            <div v-for="(comment, index) in comments" :key="comment.id">
              <comment
                :comment="comment"
                :commentIndex="index"
                :post="post"
                @comment-delete="commentDelete($event)"
              ></comment>
            </div>
            <client-only>
              <infinite-loading-component
                :componentName="'comment'"
                @infinite-handler="infiniteHandler"
              ></infinite-loading-component>
            </client-only>
          </div>
        </div>
      </div>
    </v-main>
  </div>
</template>

<script>
import InfiniteLoadingComponent from "~/components/InfiniteLoadingComponent.vue";
import ResizableTextarea from "~/assets/ResizableTextarea.js";
import NavBar from "~/components/NavBar";
import SignUpIn from "~/components/SignUpIn.vue";
import Slug from "slug";
import { db, firebase } from "~/plugins/firebase";
import {
  FETCH_POST,
  COMMENT_CREATE,
  FETCH_COMMENTS,
  FETCH_NEXT_COMMENTS,
  COMMENT_DELETE,
  GET_AUTH_CURRENTUSER,
  GET_USER_FROM_UID
} from "~/store/actions_type";
import Comment from "~/components/Comment.vue";
import { SET_COMMENTS, RESET_STATE } from "~/store/mutations_type";
import DialogError from "~/components/DialogError";

export default {
  data() {
    return {
      text: "",
      lastVisible: null,
      isFirstCalled: false,
      state: null,
      canPushSendBtn: true
    };
  },
  components: {
    ResizableTextarea,
    Comment,
    NavBar,
    DialogError,
    SignUpIn,
    InfiniteLoadingComponent
  },
  mounted() {
    this.$store.commit(`comment_module/${RESET_STATE}`);
    this.$store.commit(`post_module/${RESET_STATE}`);
    this.$store.commit(`user_module/${RESET_STATE}`);
  },

  methods: {
    async getCurrentUser() {
      const authCurrentUser = await this.$store.dispatch(
        `auth_module/${GET_AUTH_CURRENTUSER}`
      );
      if (authCurrentUser) {
        await this.$store.dispatch(
          `user_module/${GET_USER_FROM_UID}`,
          authCurrentUser.uid
        );
      }
    },
    async infiniteHandler($state) {
      var errorMessage = "";

      try {
        //1回目のローディング
        if (!this.isFirstCalled) {
          this.state = $state;
          await this.getCurrentUser();
          const returnObj = await this.firstCall();
          this.lastVisible = returnObj.lastVisible;

          this.isFirstCalled = true;
          $state.reset();
          if (returnObj.isEmpty) {
            $state.complete();
          } else {
            $state.loaded();
          }
          return;
        }
        //２回目以降のローディングはこちらを走る。
        const returnObj = await this.nextCall();
        this.lastVisible = returnObj.lastVisible;
        if (returnObj.isEmpty) {
          $state.complete();
        } else {
          $state.loaded();
        }
      } catch (err) {
        errorMessage = err.message;
        console.log("n/_post/comments/index.vue error: ", errorMessage);
      } finally {
        if (errorMessage) {
          $state.complete();
        }
      }
    },
    async firstCall() {
      const post = await this.fetchPost();
      let returnObj = await this.$store.dispatch(
        `comment_module/${FETCH_COMMENTS}`,
        post.id
      );
      return returnObj;
    },
    async nextCall() {
      const lastVisible = this.lastVisible;
      const postId = this.post.id;
      const comments = this.comments;
      const returnObj = await this.$store.dispatch(
        `comment_module/${FETCH_NEXT_COMMENTS}`,
        {
          postId,
          comments,
          lastVisible
        }
      );
      return returnObj;
    },
    async fetchPost() {
      let slug = this.$route.params.post;

      let post = await this.$store.dispatch(`post_module/${FETCH_POST}`, {
        slug,
        currentUid: this.currentUid
      });
      return post;
    },

    createAccount() {
      if (!this.user) {
        this.$refs.signUpInRef.show("comment");
        return;
      }
    },
    async sendComment() {
      if (!this.canPushSendBtn || !this.text) {
        return;
      }
      this.canPushSendBtn = false;
      try {
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        const commentId = db.collection("comments").doc().id;
        const newSlug = this.makeSlug();

        var contents = [
          {
            type: "TEXT",
            data: this.text
          }
        ];
        const comment = {
          id: commentId,
          slug: newSlug,
          createdAt: timestamp,
          updatedAt: timestamp,
          deletedAt: null,
          contents: contents,
          status: 1,
          postId: this.post.id,
          postSlug: this.post.slug,
          user: {
            uid: this.user.uid,
            profileImageUrl: this.user.profileImageUrl,
            username: this.user.username,
            name: this.user.name
          }
        };

        await this.$store.dispatch(`comment_module/${COMMENT_CREATE}`, {
          comment
        });

        this.lastVisible = null;
        this.isFirstCalled = false;
        this.infiniteHandler(this.state);
      } catch (err) {
        const errorMessage = err.message;
        this.$refs.dialogErrorRef.showError(errorMessage);
      } finally {
        this.text = "";
        this.canPushSendBtn = true;
      }
    },
    makeSlug() {
      const maxLength = 60;

      var cont = this.text;
      cont = cont.replace(/<[^>]*>/g, " ");
      cont = cont.replace(/\s+/g, " ");
      cont = cont.replace(/&nbsp;/g, " ");
      cont = cont.trim();
      var lettersCount = cont.length;
      var wordsCount = cont.split(" ").length;

      if (lettersCount <= maxLength) {
        console.log("60文字以下");
        return Slug(this.text) + "-";
      }
      console.log("61文字以上");
      var trimmedString = this.text.substr(0, maxLength);
      trimmedString = trimmedString.substr(
        0,
        Math.min(trimmedString.length, trimmedString.lastIndexOf(" "))
      );
      return Slug(trimmedString) + "-";
    },
    commentDelete(event) {
      try {
        let commentIndex = event;
        this.$store.dispatch(`comment_module/${COMMENT_DELETE}`, {
          comment: this.comments[commentIndex],
          post: this.post
        });

        this.comments.splice(commentIndex, 1);
        let returnObj = {
          comments: this.comments,
          lastVisible: this.lastVisible
        };

        this.$store.commit(`comment_module/${SET_COMMENTS}`, returnObj);
      } catch (err) {
        this.$refs.dialogErrorRef.showError(err.message);
      }
    }
  },
  computed: {
    post() {
      const post = this.$store.getters["post_module/post"];
      return post;
    },
    comments() {
      const comments = this.$store.getters["comment_module/comments"];
      return comments;
    },
    user() {
      const user = this.$store.getters["user_module/user"];
      return user;
    }
  }
};
</script>

<style scoped>
.container-fluid {
  max-width: 680px;
  /* background-color: darkslategray; */
}

.v-main div div p {
  font-size: 1.6rem;
}
.create-account-text {
  font-size: 1.8rem;
  cursor: pointer;
  color: #2db696;
}

textarea {
  background-color: white;
  overflow: hidden;
  padding: 1rem;
  width: 100%;
  font-size: 1.8rem;
  margin-top: 1rem;
  display: block;
  border-radius: 0.5rem;
  border: 0.1rem solid #888;
  line-height: 200%;
}

.name {
  color: #2db696;
  padding: 1rem;
  font-size: 1.6rem;
  margin-bottom: 0;
}

.send-btn {
  background-color: white;
  font-size: 1.8rem;
  padding: 1rem;
  border-radius: 0.5rem;
}
</style>

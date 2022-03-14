<template>
  <div>
    <nav-bar></nav-bar>
    <v-main>
      <v-container style="max-width: 680px;">
        <profile-header
          v-if="user"
          :user="user"
          :currentUid="currentUid"
        ></profile-header>
        <div v-for="post in posts" :key="post.id">
          <post :post="post"></post>
        </div>

        <client-only>
          <infinite-loading-component
            :componentName="''"
            @infinite-handler="infiniteHandler"
          ></infinite-loading-component>
        </client-only>
      </v-container>
    </v-main>
  </div>
</template>

<script>
import NavBar from "@/components/NavBar";
import Post from "~/components/Post.vue";
import ProfileHeader from "~/components/ProfileHeader.vue";
import { FETCH_END, RESET_STATE } from "~/store/mutations_type";
import { AuthService } from "~/apis/auth_service";

import InfiniteLoadingComponent from "~/components/InfiniteLoadingComponent.vue";
import {
  FETCH_LIKED_POSTS,
  FETCH_LIKED_NEXT_POSTS,
  FETCH_USER,
  GET_AUTH_CURRENTUSER
} from "~/store/actions_type";
export default {
  components: {
    Post,
    NavBar,
    ProfileHeader,
    InfiniteLoadingComponent
  },
  data() {
    return {
      user: null,
      lastVisible: null,
      isFirstCalled: false
    };
  },

  mounted() {
    this.$store.commit(`user_module/${RESET_STATE}`);
  },

  methods: {
    async getCurrentUserAndUser() {
      // get params
      let username = this.$route.params.user;
      // get currentUid
      const authCurrentUser = this.$store.dispatch(
        `auth_module/${GET_AUTH_CURRENTUSER}`
      );

      // get user
      const user = this.$store.dispatch(`user_module/${FETCH_USER}`, username);

      //※ postResponseは、NavPublish.vueのcomputedのpostに使われてる
      const [authCurrentUserResponse, userResponse] = await Promise.all([
        authCurrentUser,
        user
      ]);

      this.user = userResponse;
      return;
    },
    async infiniteHandler($state) {
      var errorMessage = "";
      try {
        //1回目のローディング
        if (!this.isFirstCalled) {
          await this.getCurrentUserAndUser();

          const returnObj = await this.firstCall();
          this.isFirstCalled = true;
          this.lastVisible = returnObj.lastVisible;

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
      } finally {
        if (errorMessage) {
          $state.complete();
        }
      }
    },
    async firstCall() {
      let returnObj = await this.$store.dispatch(
        `user_module/${FETCH_LIKED_POSTS}`,
        {
          uid: this.user.uid,
          currentUid: this.currentUid
        }
      );

      return returnObj;
    },
    async nextCall() {
      const returnObj = await this.$store.dispatch(
        `user_module/${FETCH_LIKED_NEXT_POSTS}`,
        {
          uid: this.user.uid,
          currentUid: this.currentUid,
          lastVisible: this.lastVisible,
          posts: this.posts
        }
      );
      return returnObj;
    }
  },

  computed: {
    posts() {
      const posts = this.$store.getters["user_module/posts"];
      return posts;
    },
    currentUid() {
      const currentUid = this.$store.getters["auth_module/currentUid"];
      return currentUid;
    }
  }
};
</script>

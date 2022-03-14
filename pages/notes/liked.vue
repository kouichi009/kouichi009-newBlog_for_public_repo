<template>
  <div>
    <nav-bar></nav-bar>
    <v-main>
      <library-tab></library-tab>
      <div v-for="post in posts" :key="post.id">
        <post :post="post"></post>
      </div>
      <client-only>
        <client-only>
          <infinite-loading-component
            :componentName="''"
            @infinite-handler="infiniteHandler"
          ></infinite-loading-component>
        </client-only>
      </client-only>
    </v-main>
  </div>
</template>

<script>
import InfiniteLoadingComponent from "~/components/InfiniteLoadingComponent.vue";
import NavBar from "@/components/NavBar";
import Post from "~/components/Post.vue";
import LibraryTab from "~/components/LibraryTab.vue";
import { RESET_STATE } from "~/store/mutations_type";
import { AuthService } from "~/apis/auth_service";
import {
  FETCH_LIKED_POSTS,
  FETCH_LIKED_NEXT_POSTS,
  GET_AUTH_CURRENTUSER
} from "~/store/actions_type";
export default {
  components: {
    Post,
    NavBar,
    LibraryTab,
    InfiniteLoadingComponent
  },
  data() {
    return {
      lastVisible: null,
      isFirstCalled: false
    };
  },
  mounted() {
    this.$store.commit(`user_module/${RESET_STATE}`);
  },
  methods: {
    async infiniteHandler($state) {
      var errorMessage = "";

      try {
        //1回目のローディング
        if (!this.isFirstCalled) {
          await this.$store.dispatch(`auth_module/${GET_AUTH_CURRENTUSER}`);
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
        console.log("pages/notes/liked.vue error: ", errorMessage);
      } finally {
        if (errorMessage) {
          $state.complete();
        }
      }
    },
    async firstCall() {
      let returnObj = await this.$store.dispatch(
        `user_module/${FETCH_LIKED_POSTS}`,
        { uid: this.currentUid, currentUid: this.currentUid }
      );
      return returnObj;
    },
    async nextCall() {
      const returnObj = await this.$store.dispatch(
        `user_module/${FETCH_LIKED_NEXT_POSTS}`,
        {
          uid: this.currentUid,
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

<style scoped></style>

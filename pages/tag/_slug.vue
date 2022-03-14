<template>
  <div>
    <nav-bar></nav-bar>
    <v-main>
      <div class="my-5">
        <div v-for="post in posts" :key="post.id">
          <post :post="post"></post>
        </div>
        <client-only>
          <infinite-loading-component
            :componentName="''"
            @infinite-handler="infiniteHandler"
          ></infinite-loading-component>
        </client-only>
      </div>
    </v-main>
  </div>
</template>

<script>
import InfiniteLoadingComponent from "~/components/InfiniteLoadingComponent.vue";
import NavBar from "@/components/NavBar";
import Post from "~/components/Post.vue";
import { RESET_STATE } from "~/store/mutations_type";
import {
  FETCH_TAG_POSTS,
  FETCH_NEXT_TAG_POSTS,
  GET_AUTH_CURRENTUSER
} from "~/store/actions_type";
import { AuthService } from "~/apis/auth_service";

export default {
  components: {
    Post,
    NavBar,
    InfiniteLoadingComponent
  },
  data() {
    return {
      lastVisible: null,
      isFirstCalled: false,
      tag: ""
    };
  },
  beforeCreate() {},
  mounted() {
    this.$store.commit(`home_module/${RESET_STATE}`);
    this.tag = this.$route.params.slug;
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
        console.log("pages/tag/_slug.vue error: ", errorMessage);
      } finally {
        if (errorMessage) {
          $state.complete();
        }
      }
    },
    async firstCall() {
      const tag = this.tag;
      var returnObj = await this.$store.dispatch(
        `home_module/${FETCH_TAG_POSTS}`,
        {
          currentUid: this.currentUid,
          tag
        }
      );
      return returnObj;
    },
    async nextCall() {
      const lastVisible = this.lastVisible;
      const posts = this.posts;
      const tag = this.tag;
      const returnObj = await this.$store.dispatch(
        `home_module/${FETCH_NEXT_TAG_POSTS}`,
        {
          currentUid: this.currentUid,
          lastVisible,
          tag,
          posts
        }
      );
      return returnObj;
    }
  },

  computed: {
    posts() {
      const posts = this.$store.getters["home_module/posts"];
      return posts;
    },
    currentUid() {
      const currentUid = this.$store.getters["auth_module/currentUid"];
      return currentUid;
    }
  }
};
</script>

<style></style>

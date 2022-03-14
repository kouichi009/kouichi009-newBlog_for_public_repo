<template>
  <div>
    <nav-bar></nav-bar>
    <v-main>
      <div v-for="post in posts" :key="post.id">
        <post :post="post"></post>
      </div>
      <client-only>
        <infinite-loading-component
          :componentName="''"
          @infinite-handler="infiniteHandler"
        ></infinite-loading-component>
      </client-only>
    </v-main>
  </div>
</template>

<script>
import NavBar from "@/components/NavBar";
import Post from "~/components/Post.vue";
import InfiniteLoadingComponent from "~/components/InfiniteLoadingComponent.vue";
import {
  FETCH_POSTS,
  FETCH_NEXT_POSTS,
  GET_AUTH_CURRENTUSER
} from "~/store/actions_type";
import { RESET_STATE } from "~/store/mutations_type";

export default {
  name: "name",
  components: {
    Post,
    NavBar,
    InfiniteLoadingComponent
  },
  data() {
    return {
      lastVisible: null,
      isFirstCalled: false
    };
  },
  beforeCreate() {
    console.log("beforeCreate1");
  },
  created() {
    console.log("created1");
  },
  mounted() {
    console.log("mounted1");
    console.log("develop or production status@@@@: ", process.env.NODE_ENV);
    this.$store.commit(`home_module/${RESET_STATE}`);
  },
  methods: {
    async infiniteHandler($state) {
      var errorMessage = "";
      try {
        //1回目のローディング
        if (!this.isFirstCalled) {
          console.log(
            "infiniteHandler index1 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
          );
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
        console.log(
          "infiniteHandler index3 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
        );

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
        console.log("pages/index.vue error: ", errorMessage);
      } finally {
        if (errorMessage) {
          $state.complete();
        }
      }
    },
    async firstCall() {
      console.log(
        "infiniteHandler index2.5 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ ",
        this.currentUid
      );
      var returnObj = await this.$store.dispatch(`home_module/${FETCH_POSTS}`, {
        currentUid: this.currentUid
      });
      console.log("firstCall ", returnObj);

      return returnObj;
    },
    async nextCall() {
      const lastVisible = this.lastVisible;
      const posts = this.posts;
      const returnObj = await this.$store.dispatch(
        `home_module/${FETCH_NEXT_POSTS}`,
        {
          currentUid: this.currentUid,
          lastVisible,
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

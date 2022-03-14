<template>
  <div>
    <nav-bar v-if="!isError404Flg"></nav-bar>
    <v-main>
      <client-only>
        <dialog-error ref="dialogErrorRef"></dialog-error>
        <dialog-confirm-post ref="dialogConfirmPostRef"></dialog-confirm-post>
      </client-only>
      <div v-if="post && user">
        <detail-post :post="post" :user="user"></detail-post>
        <Footer />
      </div>
      <div v-if="isError404Flg">
        <error404></error404>
      </div>
    </v-main>
  </div>
</template>

<script>
import NavBar from "@/components/NavBar";
import DialogError from "~/components/DialogError";
import DetailPost from "~/components/DetailPost";
import DialogConfirmPost from "~/components/DialogConfirmPost";
import Error404 from "~/components/Error404";
import { RESET_STATE } from "~/store/mutations_type";
import Footer from "~/components/Footer";

import {
  FETCH_POST,
  GET_CURRENT_USER_PRIVATEINFO,
  FETCH_USER,
  GET_AUTH_CURRENTUSER
} from "~/store/actions_type";

export default {
  data() {
    return {
      isSignedIn: false,
      currentUid: "",
      isError404Flg: false
    };
  },
  components: {
    NavBar,
    DialogError,
    DetailPost,
    DialogConfirmPost,
    Error404,
    Footer
  },

  async mounted() {
    try {
      this.$store.commit(`post_module/${RESET_STATE}`);
      this.$store.commit(`user_module/${RESET_STATE}`);
      let slug = this.$route.params.post;
      let currentUid = "";
      let authCurrentUser = await this.$store.dispatch(
        `auth_module/${GET_AUTH_CURRENTUSER}`
      );

      if (authCurrentUser) {
        await this.$store.dispatch(
          `auth_module/${GET_CURRENT_USER_PRIVATEINFO}`,
          authCurrentUser.uid
        );
        currentUid = authCurrentUser.uid;
      }

      const post = await this.$store.dispatch(`post_module/${FETCH_POST}`, {
        slug,
        currentUid: currentUid
      });

      if (!post) {
        this.isError404Flg = true;
        return;
      }
      await this.$store.dispatch(
        `user_module/${FETCH_USER}`,
        post.user.username
      );
    } catch (err) {
      const errorMessage = err.message;
      this.$refs.dialogErrorRef.showError(errorMessage);
    }
  },
  methods: {
    pushAgree() {
      this.dialog = false;
    }
  },
  computed: {
    post() {
      const post = this.$store.getters["post_module/post"];

      return post;
    },
    user() {
      const user = this.$store.getters["user_module/user"];

      return user;
    }
  }
};
</script>

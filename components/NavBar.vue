<template>
  <v-app-bar>
    <v-toolbar-title @click="toHome">Home</v-toolbar-title>
    <v-spacer></v-spacer>
    <div v-if="!currentUid">
      <sign-up-in ref="signUpInRef"></sign-up-in>
      <v-btn depressed @click="signIn" class="headline text-capitalize"
        >Login</v-btn
      >
      <v-btn
        color="#2CB696"
        class="white--text headline text-capitalize mr-5"
        @click="signUp"
        >Sign Up</v-btn
      >
    </div>
    <div v-else-if="currentUid">
      <div v-if="path && (path.first === 'notes' || path.first === 'new')">
        <nav-publish
          :path="path"
          :postId="postId"
          :isTitleError="isTitleError"
          :isSaved="isSaved"
        ></nav-publish>
      </div>
      <div v-else>
        <nav-notification-avatar></nav-notification-avatar>
      </div>
    </div>
  </v-app-bar>
</template>

<script>
import NavPublish from "~/components/NavPublish.vue";
import SignUpIn from "~/components/SignUpIn.vue";
import NavNotificationAvatar from "~/components/NavNotificationAvatar.vue";

export default {
  props: ["path", "postId", "isTitleError", "isSaved"],
  data() {
    return {};
  },
  mounted() {},
  components: { NavPublish, NavNotificationAvatar, SignUpIn },

  methods: {
    signUp() {
      this.$refs.signUpInRef.show("signup");
    },
    signIn() {
      this.$refs.signUpInRef.show("signin");
    },
    toHome() {
      this.$router.push({ path: `/` });
    }
  },
  computed: {
    currentUid() {
      const currentUid = this.$store.getters["auth_module/currentUid"];
      return currentUid;
    }
  }
};
</script>

<style scoped>
.v-toolbar__title {
  cursor: pointer;
  font-size: 2rem;
  margin-left: 10px;
}

@media (max-width: 576px) {
  .v-toolbar__title {
    cursor: pointer;
    font-size: 1.6rem;
    margin-left: 5px;
  }
}
</style>

<template>
  <main>
    <nav-bar></nav-bar>
    <v-main>
      <dialog-error ref="dialogErrorRef"></dialog-error>
      <div class="container-fluid px-5 py-5 mx-auto">
        <setting-tab></setting-tab>
        <v-card class="mt-5" v-if="user">
          <br />
          <span class="ma-5 grey--text f-14">Your username</span>
          <v-btn
            style="font-size: 14px"
            class="text-capitalize"
            small
            color="#2CB696"
            outlined
            @click="goToEdit"
            >Edit username</v-btn
          >
          <p class="ml-5 mt-5 f-21 f-bold">{{ user.username }}</p>
          <v-divider></v-divider>
        </v-card>
      </div>
    </v-main>
  </main>
</template>

<script>
import NavBar from "~/components/NavBar";
import SettingTab from "~/components/SettingTab.vue";
import { GET_USER_FROM_UID, GET_AUTH_CURRENTUSER } from "~/store/actions_type";
import DialogError from "~/components/DialogError";

export default {
  data() {
    return {
      tabIndex: 0,
      accountInfos: [],
      currentUser: null
    };
  },
  mounted() {
    this.getCurrentUserAndUser();
  },
  components: {
    NavBar,
    SettingTab,
    DialogError
  },
  methods: {
    async getCurrentUserAndUser() {
      try {
        let authCurrentUser = await this.$store.dispatch(
          `auth_module/${GET_AUTH_CURRENTUSER}`
        );

        if (!authCurrentUser) {
          this.$router.push({ path: `/` });
          return;
        }
        await this.$store.dispatch(
          `user_module/${GET_USER_FROM_UID}`,
          authCurrentUser.uid
        );
      } catch (err) {
        this.$refs.dialogErrorRef.showError(err.message);
      }
    },
    goToEdit() {
      this.$router.push({
        path: `/settings/account/edit`
      });
    }
  },
  computed: {
    user() {
      let user = this.$store.getters["user_module/user"];
      return user;
    }
  }
};
</script>

<style scoped>
.container-fluid {
  max-width: 620px;
}
</style>

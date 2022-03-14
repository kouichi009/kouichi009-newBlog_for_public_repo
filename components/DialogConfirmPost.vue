<template>
  <v-dialog v-model="dialog" :persistent="persistent" max-width="580">
    <v-card class="container">
      <h1 class="f-21">{{ title }}</h1>
      <br />

      <p class="f-16" v-html="description"></p>
      <br />
      <br />
      <v-layout justify-center>
        <v-btn
          dark
          class="text-capitalize f-16"
          color="#2DB696"
          width="100px"
          @click="pushAgree"
          >{{ agreeText }}</v-btn
        >
      </v-layout>
      <br />
    </v-card>
  </v-dialog>
</template>

<script>
import {
  REGISTER_EMAIL,
  LOGOUT,
  LOGIN_GOOGLE,
  SEND_MAGIC_LINK,
  UPDATE_USER
} from "../store/actions_type";
export default {
  mounted() {},
  data() {
    return {
      title: "",
      description: "",
      agreeText: "",
      dialog: false,
      type: "",
      reloadThisPageFlg: false,
      persistent: false
    };
  },
  components: {},
  methods: {
    show(type) {
      switch (type) {
        case "post":
          this.title = "Your article was posted!";
          this.description = "Success!";
          this.agreeText = "OK";
          break;
        case "draft":
          this.title = "You kept the draft of this article";
          this.description = "";
          this.agreeText = "OK";
          break;
        case "buy":
          this.title = "You purchased this article.";
          this.description = "Success!";
          this.agreeText = "OK";
          this.reloadThisPageFlg = true;
          this.persistent = true;
          break;
        default:
          console.log("それ以外よんだよ。 @@@@@@@@@@@@@@@@@@");
          break;
      }
      this.dialog = true;
    },

    pushAgree() {
      this.dialog = false;
      if (this.reloadThisPageFlg) {
        window.location.reload();
      }
    }
  }
};
</script>

<style scoped>
.container {
  text-align: center;
  padding-top: 50px;
  max-width: 580px;
}
</style>

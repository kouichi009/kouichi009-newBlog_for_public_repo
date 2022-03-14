<template>
  <v-dialog :persistent="persistent" v-model="dialog" :max-width="dialogWidth">
    <v-card class="container">
      <p class="card-title">{{ title }}</p>
      <p class="card-explain" v-html="description"></p>
      <div v-if="type === 'error'">
        <v-text-field
          v-model="email"
          label="Email*"
          :rules="rules"
        ></v-text-field>
      </div>
      <v-btn
        v-if="type === 'username'"
        depressed
        outlined
        color="lightgray"
        class="text-capitalize mr-5"
        width="150px"
        @click="cancel"
        >cancel</v-btn
      >
      <v-btn
        dark
        class="text-capitalize agree-text"
        color="#2DB696"
        @click="pushAgree"
        >{{ agreeBtnText }}</v-btn
      >
      <p class="red--text title text-center">{{ errorMessage }}</p>
    </v-card>
  </v-dialog>
</template>

<script>
import {
  REGISTER_EMAIL,
  LOGOUT,
  LOGIN_GOOGLE,
  SEND_MAGIC_LINK,
  UPDATE_USERNAME
} from "../store/actions_type";
export default {
  mounted() {
    let x = window.matchMedia("(max-width: 576px)");
    if (x.matches) {
      this.dialogWidth = 250;
    }
  },
  data() {
    return {
      dialogWidth: 580,
      email: "",
      title: "",
      description: "",
      dialog: false,
      type: "",
      agreeBtnText: "",
      rules: [value => !!value || "Required."],
      errorMessage: "",
      loading: false,
      persistent: true,
      username: ""
    };
  },
  components: {},
  methods: {
    show(type, text) {
      this.dialog = true;
      this.type = type;

      switch (type) {
        case "signup":
          this.title = "Check your inbox";
          this.description = `We just emailed a magic link to <b>${text}</b>. <br/>Click the link to complete your account set-up.`;
          this.agreeBtnText = "OK";
          break;
        case "signin":
          this.title = "Check your inbox";
          this.description = `We just emailed a magic link to <b>${text}</b>. <br/>Click the link to sign in.`;
          this.agreeBtnText = "OK";
          break;
        case "receive":
          this.title = "You're verified on Publista";
          this.description = `Thanks for verifying your email with us. You're all set!`;
          this.agreeBtnText = "OK";
          break;
        case "error":
          this.title = "Your sign in link has expired";
          this.description =
            "Enter the email address associated with your account, and we’ll send a new magic link to your inbox.";
          this.agreeBtnText = "Continue";
          break;
        case "username":
          this.title = "Confirm";
          this.description =
            "When you change your username, existing links to your profile will no longer work. You must update this link on any external sites.";
          this.agreeBtnText = "I understand, change my username";
          this.persistent = false;
          this.username = text;

          break;
        default:
          console.log("それ以外よんだよ。 @@@@@@@@@@@@@@@@@@");
          break;
      }
    },

    async pushAgree() {
      if (this.loading) {
        return;
      }
      this.loading = true;
      switch (this.type) {
        case "signup":
        case "signin":
          this.loading = false;
          if (this.$route.path === "/") {
            window.location.reload();
          } else {
            this.$router.push({ path: `/` });
          }
          break;
        case "receive":
          this.loading = false;
          this.$router.push({ path: `/` });
          break;
        case "error":
          try {
            if (this.email === "") {
              this.errorMessage = "Please enter a valid email address";
              this.loading = false;
              return;
            }
            await this.$store.dispatch(
              `auth_module/${SEND_MAGIC_LINK}`,
              this.email
            );
          } catch (err) {
            this.errorMessage = err.message;
          } finally {
            this.loading = false;
            if (!this.errorMessage) {
              this.show("signin", this.email);
            }
          }
          break;
        case "username":
          try {
            await this.$store.dispatch(`auth_module/${UPDATE_USERNAME}`, {
              refCurrentUser: this.user,
              username: this.username
            });

            window.location.reload();
          } catch (err) {
            this.errorMessage = err.message;
          } finally {
            this.loading = false;
          }
          break;
        default:
          console.log("それ以外よんだよ。 @@@@@@@@@@@@@@@@@@");
          break;
      }
    },
    cancel() {
      this.dialog = false;
    }
  },
  watch: {
    email: function(newVal, oldVal) {
      if (newVal !== "") {
        this.errorMessage = "";
      }
    }
  },
  computed: {
    user() {
      return this.$store.getters["user_module/user"];
    }
  }
};
</script>

<style scoped>
.container {
  padding: 5rem 1rem;
  text-align: center;
}

.text-center1 {
  background-color: blue;
  position: absolute; /*Can also be `fixed`*/
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  /*Solves a problem in which the content is being cut when the div is smaller than its' wrapper:*/
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
}

.card-title {
  font-size: 3rem;
  font-weight: bold;
}

.card-explain {
  font-size: 1.6rem;
  margin: 5rem 3rem;
}

.v-text-field {
  margin: 3rem 5rem;
}

.agree-text {
  font-size: 1.6rem;
  width: 15rem;
}

@media (max-width: 576px) {
  .card-title {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .card-explain {
    font-size: 1.2rem;
    margin: 2.5rem 0;
  }

  .v-text-field {
    font-size: 1.2rem;
    margin: 3rem 2rem;
  }

  .agree-text {
    width: 15rem;
    font-size: 1.4rem;
  }
}
</style>

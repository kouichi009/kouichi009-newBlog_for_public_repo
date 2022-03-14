<template>
  <v-dialog v-model="dialog" :max-width="dialogWidth">
    <v-card class="container">
      <p class="card-title">{{ title }}</p>
      <p class="card-explain" v-html="description"></p>
      <p class="display-1 red--text">{{ errorMessage }}</p>
      <v-btn @click="loginWithGoogle" class="sign-btn text-capitalize" outlined>
        <img src="~/assets/google.png" width="20" height="20" />
        <span class="ml-1 f-16">{{ googleBtnText }}</span>
      </v-btn>
      <dialog-email-form :type="type"></dialog-email-form>
      <p class="switch-text">
        {{ questionText }}&nbsp;
        <span class="switch-signin" @click="pushSignText">{{ signText }}</span>
      </p>
      <p class="terms-text" v-html="policy"></p>
    </v-card>
  </v-dialog>
</template>

<script>
import { REGISTER_EMAIL, LOGOUT, LOGIN_GOOGLE } from "../store/actions_type";
import DialogEmailForm from "~/components/DialogEmailForm";
export default {
  mounted() {
    let x = window.matchMedia("(max-width: 576px)");
    console.log("x: ", x);
    if (x.matches) {
      this.dialogWidth = 250;
    }
  },
  data() {
    return {
      dialogWidth: 580,
      title: "",
      description: `Create a free account to get great stories in
          <br />your inbox, personalize your homepage, and
          <br />follow authors
          and topics that you love.`,
      policy: `To make Publista work, we log user data and share it
        <br />with service
        providers. Click “Sign Up” above to
        <br />accept Publista’s Terms of
        Service & Privacy Policy.`,
      googleBtnText: "",
      questionText: "",
      signText: "",

      loading: false,
      errorMessage: "",
      path: "",
      dialog: false,
      type: ""
    };
  },
  components: {
    DialogEmailForm
  },
  methods: {
    show(type) {
      this.dialog = true;
      this.type = type;
      switch (type) {
        case "signup":
          this.title = "Join Publista.";
          this.setSignUpBtnText();
          break;
        case "signin":
          this.title = "Welcome back.";
          this.googleBtnText = "Sign in with Google";
          this.questionText = "No account?";
          this.signText = "Create account";
          break;
        case "like":
          this.title = "Create an account to like this article.";
          this.description = "";
          this.setSignUpBtnText();
          break;
        case "comment":
          this.title = "Create an account to post a comment.";
          this.description = "";
          this.setSignUpBtnText();
          break;
        case "buy":
          this.title = "Create an account to buy this article.";
          this.description = "";
          this.setSignUpBtnText();
          break;
        default:
          console.log("それ以外よんだよ。 @@@@@@@@@@@@@@@@@@");
          break;
      }
    },
    setSignUpBtnText() {
      this.googleBtnText = "Sign up with Google";
      this.questionText = "Already have an account?";
      this.signText = "Sign in";
    },
    pushSignText() {
      if (this.type === "signin") {
        this.type = "signup";
        this.show(this.type);

        ////////////////////////////////////////////////////////////////////////////
      } else {
        this.type = "signin";
        this.show(this.type);
      }
    },

    async loginWithGoogle() {
      if (this.loading) {
        return;
      }
      this.errorMessage = "";
      try {
        this.loading = true;
        const user = await this.$store.dispatch(`auth_module/${LOGIN_GOOGLE}`);
        console.log(this.$route.path);
        window.location.reload();
      } catch (err) {
        this.errorMessage = err.message;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.container {
  text-align: center;
  padding-top: 50px;
}

.sign-btn {
  margin: 4rem 0 1rem;
  border: 2px solid lightgray;
  width: 100%;
}

.switch-text {
  margin: 4rem 0 2rem;
  font-size: 1.6rem;
}

.switch-signin {
  font-weight: bold;
  cursor: pointer;
  color: #2db696;
}

.card-title {
  font-size: 2.5rem;
  font-weight: bold;
}

.card-explain {
  font-size: 1.6rem;
}

.terms-text {
  font-size: 1.2rem;
  /* margin: 0 0 rem; */
}

@media (max-width: 576px) {
  .card-title {
    font-size: 2rem;
    font-weight: bold;
  }

  .card-explain {
    font-size: 1.1rem;
  }

  .sign-btn {
    margin: 2rem 0 1rem;
    border: 2px solid lightgray;
    width: 100%;
    font-size: 1.2rem;
  }

  .switch-text {
    margin: 2rem 0 2rem;
    font-size: 1.2rem;
  }

  .switch-signin {
    font-weight: bold;
    cursor: pointer;
    color: #2db696;
  }
  .terms-text {
    font-size: 0.8rem;
  }
}
</style>

<template>
  <div>
    <dialog-confirm-account
      ref="dialogConfirmAccountRef"
    ></dialog-confirm-account>
    <v-dialog v-model="dialog" :max-width="dialogWidth">
      <!-- <template v-slot:activator="{ on }">
        <v-btn class="sign-btn text-capitalize" outlined v-on="on">
          <v-icon left>mdi-email-outline</v-icon>
          <span class="f-16">{{ btnText }}</span>
        </v-btn>
      </template> -->
      <v-card class="container">
        <p class="display-1">{{ dialogTitle }}</p>
        <p class="explain-text">{{ dialogDescription }}</p>
        <v-text-field
          class="email-input"
          v-model="email"
          label="Email*"
          @keyup="inputing"
          :rules="rules"
        ></v-text-field>
        <v-btn
          dark
          class="text-capitalize agree-text"
          color="#2DB696"
          @click="pushAgree"
          :loading="loading"
          >{{ agreeBtnText }}</v-btn
        >
        <!-- <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="email" label="Email*" @keyup="inputing" :rules="rules"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-layout justify-center>
                  <v-btn
                    dark
                    class="text-capitalize"
                    color="#2DB696"
                    width="150px"
                    @click="pushAgree"
                    :loading="loading"
                  >{{agreeBtnText}}</v-btn>
                </v-layout>
              </v-col>
              <span class="display-1 red--text">{{errorMessage}}</span>
            </v-row>
          </v-container>
        </v-card-text>-->
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {
  REGISTER_EMAIL,
  LOGIN_EMAIL,
  SEND_MAGIC_LINK,
} from "../store/actions_type";
import DialogConfirmAccount from "~/components/DialogConfirmAccount";

export default {
  props: ["type"],
  data: () => ({
    dialogWidth: 580,
    dialog: false,
    loading: false,
    email: "nextstudy001@gmail.com",
    path: "",
    btnText: "",
    dialogTitle: "",
    dialogDescription: "",
    agreeBtnText: "",
    errorMessage: "",
    rules: [(value) => !!value || "Required."],
  }),

  components: { DialogConfirmAccount },

  mounted() {
    let x = window.matchMedia("(max-width: 576px)");
    if (x.matches) {
      this.dialogWidth = 250;
    }
    if (this.type === "signin") {
      this.setSignInText();
    } else {
      this.setSignUpText();
    }
  },

  methods: {
    pushAgree() {
      if (this.loading) {
        return;
      }
      this.loading = true;
      if (this.email.length === 0) {
        this.errorMessage = "Please enter a valid email address";
        this.loading = false;
        return;
      }

      this.sendMagicLink();
    },
    async sendMagicLink() {
      const email = this.email;
      try {
        await this.$store.dispatch(`auth_module/${SEND_MAGIC_LINK}`, email);
      } catch (err) {
        this.errorMessage = err.message;
      } finally {
        this.loading = false;
        if (!this.errorMessage) {
          if (this.type === "signup") {
            this.showCheckBox("signup", email);
          } else if (this.type === "signin") {
            this.showCheckBox("signin", email);
          }
        }
      }
    },

    inputing() {
      this.errorMessage = "";
    },
    setSignUpText() {
      this.btnText = "Sign up with Email";
      this.dialogTitle = "Sign up with email";
      this.dialogDescription = "Enter your email address to create an account.";
      this.agreeBtnText = "Sign up";
    },
    setSignInText() {
      this.btnText = "Sign in with Email";
      this.dialogTitle = "Sign in with email";
      this.dialogDescription =
        "Enter the email address associated with your account.";
      this.agreeBtnText = "Sign in";
    },
    showCheckBox(type, email) {
      this.$refs.dialogConfirmAccountRef.show(type, email);
    },
  },
  watch: {
    type: function (newVal, oldVal) {
      if (newVal === "signin") {
        this.setSignInText();
      } else {
        this.setSignUpText();
      }
    },
  },
};
</script>

<style scoped>
.container {
  text-align: center;
  padding-top: 50px;
}

.sign-btn {
  margin-top: 1rem;
  border: 2px solid lightgray;
  width: 100%;
}

.explain-text {
  margin-top: 2rem;
  font-size: 1.6rem;
}

.email-input {
  margin: 3rem 5rem;
}

.agree-text {
  width: 15rem;
  font-size: 1.6rem;
  margin-bottom: 2rem;
}

@media (max-width: 576px) {
  .sign-btn {
    margin-top: 1rem;
    border: 2px solid lightgray;
    width: 100%;
    font-size: 1.2rem;
  }
  .explain-text {
    margin: 0 1.5rem;
    margin-top: 2rem;
    font-size: 1.2rem;
  }

  .email-input {
    font-size: 1.2rem;
    margin: 3rem 2rem;
  }

  .agree-text {
    width: 10rem;
    font-size: 1.4rem;
    margin-bottom: 2rem;
  }
}
</style>

<template>
  <main>
    <nav-bar></nav-bar>
    <v-main>
      <dialog-error ref="dialogErrorRef"></dialog-error>
      <dialog-confirm-account
        ref="dialogConfirmAccountRef"
      ></dialog-confirm-account>
      <div class="container-fluid px-5 py-5 mx-auto">
        <setting-tab></setting-tab>
        <v-card class="mt-5">
          <p>currentUsername: {{ currentUsername }}</p>
          <p>username: {{ username }}</p>

          <div>
            <v-form>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      class="mb-0"
                      v-model="username"
                      single-line
                      outlined
                      :rules="rules"
                      @keyup="onDebounce"
                    >
                      <template v-slot:prepend>
                        <span style="color: black;">https://note.com/</span>
                      </template>
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </div>
          <p v-if="errorMessage" class="f-16 text-center red--text">
            {{ errorMessage }}
          </p>
          <p
            v-if="successMessage"
            class="f-16 text-center"
            style="color: #2cb696"
          >
            {{ successMessage }}
          </p>

          <button class="cancel-btn" @click="cancel">Cancel</button>
          <button class="edit-btn" @click="save">Save</button>
          <br />
          <br />
        </v-card>
      </div>
    </v-main>
  </main>
</template>

<script>
import NavBar from "~/components/NavBar";
import debounce from "lodash/debounce";
import SettingTab from "~/components/SettingTab.vue";
import DialogConfirmAccount from "~/components/DialogConfirmAccount";
import DialogError from "~/components/DialogError";
import { GET_USER_FROM_UID, GET_AUTH_CURRENTUSER } from "~/store/actions_type";
import { AuthService } from "~/apis/auth_service";

export default {
  data() {
    return {
      tabIndex: 0,
      title: "",
      username: "",
      currentUsername: "",
      items: ["Account", "Credit card", "Bank account"],
      currentUser: null,
      rules: [value => !!value || "Required."],
      isusername: true,
      errorMessage: "",
      successMessage: "",
      isAvailable: false
    };
  },
  mounted() {
    this.getCurrentUserAndUser();
  },
  components: {
    NavBar,
    SettingTab,
    DialogConfirmAccount,
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
    onDebounce: debounce(function() {
      this.checkOverlapUsername();
    }),
    async checkOverlapUsername() {
      try {
        const regex = "^[a-zA-Z0-9_.]*$";

        this.errorMessage = "";
        this.successMessage = "";

        if (
          this.currentUsername.toLowerCase() === this.username.toLowerCase()
        ) {
          this.isAvailable = false;
          this.errorMessage =
            "Oops! That’s the same username you’re using now. ";
          return;
        } else if (!this.username.match(regex)) {
          this.errorMessage =
            "Usernames may only use letters, numbers, “.”, and “_”";
          return;
        } else if (this.username.length < 3 || this.username.length > 30) {
          this.errorMessage = "Usernames must be 3 to 30 characters.";
          return;
        }

        this.isAvailable = await AuthService.checkOverlapUsername(
          this.user.uid,
          this.username
        );

        if (this.isAvailable) {
          this.errorMessage = "";
          this.successMessage = "Username available";
        } else {
          this.successMessage = "";
          this.errorMessage = "Username is not available";
        }
      } catch (err) {
        this.errorMessage = err.message;
      }
    },

    cancel() {
      this.$router.push({ path: `/settings/account` });
    },
    save() {
      console.log(this.isAvailable, this.username);
      if (this.isAvailable) {
        this.$refs.dialogConfirmAccountRef.show("username", this.username);
      }
    }
  },
  computed: {
    user() {
      let user = this.$store.getters["user_module/user"];
      return user;
    }
  },
  watch: {
    user: function(newVal, oldVal) {
      this.username = newVal.username;
      this.currentUsername = newVal.username;
    }
  }
};
</script>

<style scoped>
.container-fluid {
  max-width: 620px;
}

.cancel-btn {
  border: 2px solid lightgray;
  border-radius: 10px;
  width: 100px;
  padding: 10px;
  font-size: 18px;
  margin-top: 10px;
}
.edit-btn {
  float: right;
  border: 2px solid lightgray;
  border-radius: 10px;
  width: 100px;
  padding: 10px;
  color: white;
  font-size: 18px;
  background-color: #2cb696;
  margin-top: 10px;
}
</style>

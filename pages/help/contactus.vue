<template>
  <div>
    <sidebar-help></sidebar-help>
    <div class="container" style="margin-top: 80px">
      <div v-if="!isSentMessage">
        <p class="f-25 font-weight-bold">
          Have Any Questions?
        </p>
        <p class="f-16">
          Contact us by filling out the information below.
        </p>

        <v-alert v-if="warningMessage" type="warning">
          <div class="text-h4">
            {{ warningMessage }}
          </div>
        </v-alert>

        <v-alert v-if="errorMessage" type="error">
          <div class="text-h4">
            {{ errorMessage }}
          </div>
        </v-alert>

        <p class="f-16 font-weight-bold required-field mt-10">
          Your email address
        </p>
        <v-text-field v-model="email" single-line outlined></v-text-field>
        <p class="f-16 font-weight-bold">Your Publista username<br /></p>
        <v-text-field v-model="username" single-line outlined></v-text-field>
        <p class="f-14 mt-0">
          Username of the account associated with your email address
        </p>
        <div v-show="false">
          <!-- ハニーポット用のフィールドを作ります。
      ハニーポット用のフィールドに入力があった場合にスパムと判定されフォームが送信されません。
      このフィールドは人間の場合は見えなくでもいいのでv-show=falseで非表示にしておきます。 -->
          <label for="message">スパムでない場合は空欄</label>
          <input type="text" name="bot-field" v-model="honeyBotField" />
        </div>
        <p class="f-16 font-weight-bold mt-10 required-field">Description</p>
        <v-textarea v-model="description" outlined></v-textarea>
        <v-btn
          class="text-capitalize"
          style="font-size: 18px"
          x-large
          color="success"
          dark
          @click="sendContactMessage"
          >Send Message</v-btn
        >
        <br />
        <br /><br /><br /><br />
      </div>
      <div v-else-if="isSentMessage">
        <p class="f-25 font-weight-bold">
          Message Sent Successfully!
        </p>
        <p class="f-16">
          Thank you for contacting us, we'll respond to
          <span class="font-weight-bold">{{ email }}</span> as soon as possible.
        </p>
      </div>
    </div>
    <Footer />

    <dialog-now-loading :loading="loading"></dialog-now-loading>
  </div>
</template>

<script>
import { ApiService } from "~/apis/constant_type";
import DialogNowLoading from "~/components/DialogNowLoading";
import SidebarHelp from "~/components/SidebarHelp";
import Footer from "~/components/Footer";

export default {
  components: { DialogNowLoading, SidebarHelp, Footer },
  data() {
    return {
      email: "",
      username: "",
      description: "",
      warningMessage: "",
      errorMessage: "",
      honeyBotField: "",
      isSentMessage: false,
      loading: false
    };
  },
  async mounted() {},
  methods: {
    async sendContactMessage() {
      let isEmail = ApiService.isEmail(this.email);
      this.warningMessage = "";
      this.errorMessage = "";
      console.log(
        "isEmail ",
        isEmail,
        this.description,
        this.description.length,
        this.email,
        this.username,
        this.honeyBotField,
        this.honeyBotField.length
      );

      try {
        if (!isEmail) {
          this.warningMessage = "The email address is badly formatted.";
        } else if (this.honeyBotField.length > 0) {
          // ハニーボット設置。スパム認定。
          this.warningMessage = "Error";
        } else if (this.description.length < 10) {
          this.warningMessage = "Your message is too short.";
        } else {
          this.loading = true;
          await this.$axios.$post("/api/contactus", {
            email: this.email,
            username: this.username,
            description: this.description
          });
          this.isSentMessage = true;
          console.log("success");
        }
      } catch (err) {
        console.log("errorMessage: ", err.message);
        this.errorMessage = "You failed to send message.";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style>
.container {
  padding-top: 50px;
  max-width: 700px;
}

.required-field::after {
  content: "*";
  color: red;
  margin-left: 0.25rem;
}

.v-textarea textarea {
  line-height: 40px;
}
</style>

<template>
  <div>
    <sidebar-help></sidebar-help>
    <v-main>
      <div class="px-5 py-10 mx-auto" style="max-width: 850px;">
        <h1 class="display-3 font-weight-bold">
          How to get paid
        </h1>
        <p class="mt-10 f-18">
          In order to be paid out by Publista, you need to:
        </p>
        <p class="f-18">
          1) Create an account, add your bank and payout details under “Setting
          Account". <br />2) Once you hit the ${{
            MIN_AMOUNT_TO_GET_PAID
          }}
          mark, you can request to get paid. <br />3) We review your sales to
          make sure they are legitimate. <br />4) You receive payout.
        </p>
        <p class="f-18 mt-10">
          Click "<span class="font-weight-bold">profile icon</span>" and select
          “<span class="font-weight-bold">settings</span>”.
        </p>
        <v-img class="v-img" :src="image_src1" alt="img"></v-img>
        <p class="f-18 mt-10">
          Select "<span class="font-weight-bold">Bank Account</span>" and click
          "<span class="font-weight-bold">Register</span>" to register your
          living address and bank information. (We are based on Japan so we need
          your living address to transfer money from us to you for legal
          reasons. Don't worry, you won't get any post from us.)
        </p>
        <v-img class="v-img" :src="image_src2" alt="img"></v-img>
        <p class="f-18 mt-10">
          Fill out all information and click "<span class="font-weight-bold"
            >Save</span
          >".
        </p>
        <v-img class="v-img" :src="image_src3" alt="img"></v-img>
        <p class="f-18 mt-10">
          Select "<span class="font-weight-bold">Sales management</span>" and
          set the amount you want to be paid. Then, Click "<span
            class="font-weight-bold"
            >Be Paid</span
          >"
        </p>
        <v-img class="v-img" :src="image_src4" alt="img"></v-img>
        <p class="f-18 mt-10">
          Click "<span class="font-weight-bold">Apply</span>".
        </p>
        <v-img class="v-img" :src="image_src5" alt="img"></v-img>
        <p class="f-18 mt-10">
          We usually pay to you within 2 weeks.
        </p>
        <v-img class="v-img" :src="image_src6" alt="img"></v-img>
        <br />
        <br />
      </div>
    </v-main>
    <Footer />
  </div>
</template>

<script>
import SidebarHelp from "~/components/SidebarHelp";
import Footer from "~/components/Footer";
import { MIN_AMOUNT_TO_GET_PAID } from "~/apis/constant_type";

export default {
  data() {
    return {
      image_src1: "",
      image_src2: "",
      image_src3: "",
      image_src4: "",
      image_src5: "",
      image_src6: "",
      MIN_AMOUNT_TO_GET_PAID: MIN_AMOUNT_TO_GET_PAID
    };
  },
  mounted() {
    this.image_src1 = require("~/assets/help/how_get_paid/1.png");
    this.image_src2 = require("~/assets/help/how_get_paid/2.png");
    this.image_src3 = require("~/assets/help/how_get_paid/3.png");
    this.image_src4 = require("~/assets/help/how_get_paid/4.png");
    this.image_src5 = require("~/assets/help/how_get_paid/5.png");
    this.image_src6 = require("~/assets/help/how_get_paid/6.png");
  },
  components: {
    SidebarHelp,
    Footer
  }
};
</script>

<style scoped>
.v-img {
  border: 5px solid lightgray;
}
</style>

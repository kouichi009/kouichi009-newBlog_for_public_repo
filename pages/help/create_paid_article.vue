<template>
  <div>
    <sidebar-help></sidebar-help>
    <v-main>
      <div class="px-5 py-10 mx-auto" style="max-width: 850px;">
        <h1 class="display-3 font-weight-bold">
          How to make a paid article
        </h1>
        <p class="mt-5 f-18">
          To make a paid or free article, click "<span class="font-weight-bold"
            >Write a story</span
          >" in the navigation bar.<br />
        </p>
        <p class="f-18">
          Make your article and click "<span class="font-weight-bold"
            >Publish</span
          >".
        </p>
        <v-img class="v-img" :src="image_src1" alt="img"></v-img>
        <p class="f-18" style="margin-top: 80px">
          You need to choose "<span class="font-weight-bold">fee</span>" instead
          of "<span class="font-weight-bold">free</span>" when you make a paid
          article.<br />
          Click "<span class="font-weight-bold">fee</span>". And set a price up
          to $500 (USD). <br />Then, click "<span class="font-weight-bold"
            >Next</span
          >"
        </p>
        <v-img class="v-img" :src="image_src2" alt="img"></v-img>
        <p class="f-18" style="margin-top: 80px">
          Choose where in your article to set up a paywall. Then click "<span
            class="font-weight-bold"
            >Publish Now</span
          >".
        </p>
        <v-img class="v-img" :src="image_src3" alt="img"></v-img>
        <p class="f-18" style="margin-top: 80px">
          Now, you have published a paid article.<br />
          After publishing a paid article, you will be redirected to this page
        </p>
        <v-img class="v-img" :src="image_src4" alt="img"></v-img>
        <p class="f-18" style="margin-top: 80px">
          Other people who have not purchased it yet can not see the contents.
          <br />If they want to see the contents, they will have to purchase the
          article with a credit card.
        </p>
        <v-img class="v-img" :src="image_src5" alt="img"></v-img>
      </div>
    </v-main>
    <Footer />
  </div>
</template>

<script>
import SidebarHelp from "~/components/SidebarHelp";
import Footer from "~/components/Footer";

export default {
  data() {
    return {
      image_src1: "",
      image_src2: "",
      image_src3: "",
      image_src4: "",
      image_src5: ""
    };
  },
  mounted() {
    this.image_src1 = require("~/assets/help/create_paid_article/1.png");
    this.image_src2 = require("~/assets/help/create_paid_article/2.png");
    this.image_src3 = require("~/assets/help/create_paid_article/3.png");
    this.image_src4 = require("~/assets/help/create_paid_article/4.png");
    this.image_src5 = require("~/assets/help/create_paid_article/5.png");
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

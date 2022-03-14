<template>
  <div>
    <sidebar-help></sidebar-help>
    <v-main>
      <div class="px-5 py-10 mx-auto" style="max-width: 850px;">
        <h1 class="display-3 font-weight-bold">
          Hi, there!!
        </h1>

        <p class="mt-10 f-18">
          My name is Koichi, and I am the creator of Publista.<br />
          "What is Publista?", you may ask?<br />
          Publista is a blogging platform for writing and creating your own
          amazing blog.
        </p>

        <p class="f-18">
          You can make any article you want. Share your knowledge and skills to
          your audience. Also, you can write anything and all the topics you are
          interested in. So don’t hesitate, and start with Publista now!!
        </p>

        <h2
          class="display-2 font-weight-bold"
          style="margin-top: 80px; line-height: 1.5;"
        >
          What is the most exciting feature about the website?
        </h2>
        <p class="f-18 mt-5">
          <!-- The most notable feature is that you can make a paid article, so you
          can earn money through it. You can publish it from $0 to $500 (USD). -->

          The one feature of the website is that you can monetize your articles.
          Meaning you can make money through it! You can publish it from $1 -
          $500(USD)
        </p>

        <p class="f-18 mt-5">
          Currently, Articles are sold one by one.<br />
          We will implement a paid subscription model in the future.
        </p>

        <h2
          class="display-2 font-weight-bold"
          style="margin-top: 80px;  line-height: 1.5;"
        >
          What is our vision ?
        </h2>
        <p class="f-18 mt-5">
          Our vision is to increase the number of creators who earn a living
          doing what they love.
        </p>
        <p class="f-18">
          "How can I make money?", you may ask?<br />
          You don’t need to get a lot of page views to get paid, instead, you
          get paid for every published article bought by your audience.
        </p>

        <p class="f-18 mt-5">
          In this website, you don’t have to cater to all people; rather, you
          can concentrate on catering your articles and works to your respective
          audience. And at the same time, you also grow your audience base in
          the platform.
        </p>
      </div>
    </v-main>
    <Footer />
  </div>
</template>

<script>
import SidebarHelp from "~/components/SidebarHelp";
import Footer from "~/components/Footer";
import {
  COMMISSION_RATE,
  FIXED_FEE,
  PROCESSING_RATE,
  PROCESSING_FIXED_FEE,
  MIN_AMOUNT_TO_GET_PAID,
  HELP_CENTER_MENUS
} from "~/apis/constant_type";
export default {
  data() {
    return {
      COMMISSION_RATE: COMMISSION_RATE,
      FIXED_FEE: FIXED_FEE,
      PROCESSING_RATE: PROCESSING_RATE,
      PROCESSING_FIXED_FEE: PROCESSING_FIXED_FEE,
      MIN_AMOUNT_TO_GET_PAID: MIN_AMOUNT_TO_GET_PAID,
      HELP_CENTER_MENUS: HELP_CENTER_MENUS
    };
  },
  components: {
    SidebarHelp,
    Footer
  }
};
</script>

<style>
.big-section {
  margin-top: 30px;
  border-bottom: 1px solid #ddd;
  padding: 62px 0;
  background: #f4f4f0;
}

.big-section h1 {
  font-size: 38px;
  line-height: 46px;
  font-weight: 500;
  text-align: center;
  color: #575551;
  line-height: 1.5;
}

#list-help-menu ul,
#list-help-menu li {
  font-size: 20px;
  line-height: 1.55em;
  /* color: red; */
}

#list-help-menu a {
  text-decoration: none;
}
</style>

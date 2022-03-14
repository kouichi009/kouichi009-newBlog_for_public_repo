<template>
  <div>
    <sidebar-help></sidebar-help>
    <v-main>
      <div class="px-5 py-10 mx-auto" style="max-width: 850px;">
        <h1 class="display-3 font-weight-bold">
          Welcome to Publista.
        </h1>

        <div class="big-section">
          <h1>
            Everyone can make own <br />media in Publista.<br />
            Publista is for all creators.
          </h1>
        </div>
        <p class="mt-10 f-18">
          Publista is for creators: writers, designers, software developers,
          musicians, educators, comic artists, filmmakers, and anyone
          in-between.
        </p>

        <p class="mt-10 f-18">
          Everyone can make articles; whatever they want. They can share their
          knowledge or skills to their audience. Also, they can write anything:
          journals, news and any topics they are interested in. Don’t hesitate
          to start Publista!
        </p>

        <p class="mt-10 f-18">
          "Publista" is a combination of 'publish' and a 'stand' (think KIOSK).
        </p>

        <h2
          class="display-2 font-weight-bold"
          style="margin-top: 80px; line-height: 1.5;"
        >
          We believe every creator should be able to earn a living doing what
          they love.
        </h2>
        <p class="f-18 mt-5">
          Publista enables creators to sell their articles directly to their
          audience — so that you can make a living doing what you love. Getting
          paid is simple; you should never have to think about it.
        </p>

        <h2
          class="display-2 font-weight-bold"
          style="margin-top: 80px;  line-height: 1.5;"
        >
          Can creators outside of the United States use Publista?
        </h2>
        <p class="f-18 mt-5">
          Yes! We support payouts through
          <a
            href="https://wise.com"
            target="_blank"
            style="text-decoration: none;"
          >
            TransferWise</a
          >. We currently support creators who live in the United States, the
          UK, Canada, and Australia – with more coming soon. If you live in
          other countries, please
          <a
            href="/help/contactus"
            target="_blank"
            style="text-decoration: none;"
            class="font-weight-bold"
          >
            contact us</a
          >.
        </p>
        <p class="f-18">
          Of course, if you publish only free articles, you can use Publista no
          matter where you live.
        </p>
        <h2 class="display-2 font-weight-bold" style="margin-top: 80px;">
          Help Center
        </h2>
        <div id="list-help-menu">
          <ul
            class="ma-10"
            v-for="(menu, index) in HELP_CENTER_MENUS"
            :key="index"
          >
            <li>
              <a :href="menu.url" target="_blank">{{ menu.title }}</a>
            </li>
          </ul>
        </div>
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

<template>
  <div>
    <div class="text-center mt-5">
      <p class="separator mb-0">Read More ?</p>
      <p class="grey--text mt-0" style="font-size: 1.4rem;">
        {{ post.afterPaylineWordsCount }} words left
      </p>
    </div>
    <v-card class="mx-auto payline" max-width="640px" outlined>
      <p class="mb-0 payline-title">{{ post.title }}</p>
      <p class="payline-name">{{ post.user.name }}</p>
      <p class="payline-price">${{ post.price }}</p>
      <v-btn
        color="#2CB696"
        class="text-capitalize buy-btn"
        height="50"
        @click="buy"
        >Buy this article</v-btn
      >
      <div class="my-2">
        <v-dialog v-model="dialog" :persistent="true" max-width="600px">
          <v-card
            class="px-10"
            v-if="privateInfo && privateInfo.stripeInfo.last4"
          >
            <!-- クレジットカードを登録してたらこっちを表示。 -->
            <p class="text-center headline pt-5" primary-title>
              Checkout payment
            </p>
            <v-divider></v-divider>

            <!-- <v-card-title class="text-center headline grey lighten-2" primary-title>Checkout payment</v-card-title> -->
            <p class="mb-0 mt-5 payline-title">{{ post.title }}</p>
            <p class="grey--text mb-2">{{ post.user.name }}</p>
            <p style="color: #2DB696" class="mb-2 payline-title">
              ${{ post.price }}
            </p>
            <p class="caption grey--text payline-title">
              Pay by **** **** **** **** {{ privateInfo.stripeInfo.last4 }}
            </p>

            <v-divider></v-divider>

            <v-card-actions class="pa-5">
              <v-btn
                depressed
                outlined
                color="#a8a8a8"
                width="150px"
                class="mr-5 text-capitalize payline-title"
                @click="dialog = false"
                :loading="loading"
                >Cancel</v-btn
              >
              <v-spacer></v-spacer>

              <v-btn
                class="text-capitalize payline-title"
                dark
                color="#2DB696"
                width="150px"
                @click="charge"
                :loading="loading"
                >Buy</v-btn
              >
              <!-- <v-btn color="primary" text @click="dialog = false">Buy</v-btn> -->
            </v-card-actions>
          </v-card>
          <!-- クレジットカードを登録してなかったらこっちを表示。 -->
          <credit-card
            v-else
            :stripe="stripe"
            :options="options"
            :privateInfo="privateInfo"
            @card-cancel="dialog = false"
            @save-card="saveCard($event)"
          ></credit-card>
          <!-- <div v-else>
            <p class="title">aaaaabbbbbbb cccccccc</p>
          </div>-->
        </v-dialog>

        <dialog-now-loading :loading="loading"></dialog-now-loading>

        <client-only>
          <dialog-error ref="dialogErrorRef"></dialog-error>
          <dialog-confirm-post ref="dialogConfirmPostRef"></dialog-confirm-post>
        </client-only>
      </div>
    </v-card>
  </div>
</template>

<script>
import CreditCard from "~/components/CreditCard";
import { CREATE_PAID_POSTS } from "~/store/actions_type";
import DialogError from "~/components/DialogError";
import DialogConfirmPost from "~/components/DialogConfirmPost";
import DialogNowLoading from "~/components/DialogNowLoading";
import {
  currentHostname,
  location,
  TEST_HOSTNAME,
  PRODUCT_HOSTNAME
} from "~/apis/constant_type";

export default {
  props: ["post"],
  data() {
    return {
      stripe: null,
      options: null,
      dialog: false,
      loading: true,
      message: "",
      loading: false
    };
  },

  mounted() {
    console.log(
      "payline bool @@@@@@@ ",
      currentHostname,
      !currentHostname,
      currentHostname === "",
      location
    );
    if (currentHostname === TEST_HOSTNAME) {
      this.stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    } else if (currentHostname === PRODUCT_HOSTNAME) {
      this.stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    }
    const options = {
      style: {
        base: {
          iconColor: "#666EE8",
          color: "#31325F",
          lineHeight: "40px",
          fontWeight: 300,
          fontFamily: "Helvetica Neue",
          fontSize: "20px",
          "::placeholder": {
            color: "#CFD7E0"
          }
        }
      }
    };
    this.options = options;
  },
  components: {
    CreditCard,
    DialogError,
    DialogConfirmPost,
    DialogNowLoading
  },
  methods: {
    buy() {
      console.log("privateInfo: ", this.privateInfo);

      if (this.privateInfo) {
        this.dialog = true;
      } else {
        this.$emit("buy-no-user");
      }
    },

    saveCard(event) {
      this.dialog = false;
      this.privateInfo.stripeInfo = event;
      this.dialog = true;
    },
    async charge() {
      try {
        this.loading = true;
        const customerId = this.privateInfo.stripeInfo.customerId;
        var price = this.post.price;
        let response = await this.$axios.$post("/api/stripe_charge", {
          price: parseInt(price),
          customerId: customerId
        });
        console.log("response@@@@@@@@@@@@@@@@: ", response);
        console.log("決済成功");
        this.paidPostsToFireStore();
        this.$refs.dialogConfirmPostRef.show("buy");
      } catch (err) {
        console.log("決済失敗: ", err.message);
        this.$refs.dialogErrorRef.showError("Payment failure");
      } finally {
        this.loading = false;
        this.dialog = false;
      }
    },
    paidPostsToFireStore() {
      this.$store.dispatch(`post_module/${CREATE_PAID_POSTS}`, {
        post: this.post,
        currentUid: this.privateInfo.uid
      });
    }
  },
  watch: {
    loading(val) {
      if (!val) return;
      setTimeout(() => (this.loading = false), 10000);
    }
  },
  computed: {
    privateInfo() {
      console.log("pl 1 ", this.$store.getters["auth_module/privateInfo"]);
      return this.$store.getters["auth_module/privateInfo"];
    }
  }
};
</script>
<style scoped>
.payline {
  padding: 3rem 10rem;
}
.payline2 {
  /* padding: 1rem 5rem; */
}

.payline-title {
  font-size: 1.8rem;
  font-weight: bold;
}

.payline-name {
  font-size: 1.4rem;
  color: darkgray;
}

.payline-price {
  font-size: 1.8rem;
  font-weight: bold;
  color: #2db696;
}

.buy-btn {
  background-color: #2db696;
  color: white;
  width: 100%;
  font-size: 1.6rem;
}

.separator {
  font-size: 1.6rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  text-align: center;
}
.separator::before,
.separator::after {
  content: "";
  flex: 1;
  border-bottom: 1px dashed grey;
}
.separator::before {
  margin-right: 0.25em;
}
.separator::after {
  margin-left: 0.25em;
}

@media (max-width: 576px) {
  .payline {
    padding: 1.5rem 1rem;
  }
}
</style>

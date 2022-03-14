<template>
  <div>
    <nav-bar></nav-bar>
    <v-main>
      <dialog-error ref="dialogErrorRef"></dialog-error>
      <dialog-confirm
        ref="dialogConfirmRef"
        @card-delete="pushCardDelete"
      ></dialog-confirm>
      <div class="container-fluid px-5 py-5 mx-auto">
        <setting-tab></setting-tab>

        <div
          class="my-5 payment-form"
          v-if="privateInfo && privateInfo.stripeInfo.last4"
        >
          <div>
            <h5 class="#e0e0e0 grey lighten-4">Payment Method</h5>

            <div class="row">
              <div class="col-sm-6 f-16">
                <p class="mb-0 ml-2">Credit card number</p>
                <p class="ml-2">
                  ************{{ privateInfo.stripeInfo.last4 }}
                </p>
              </div>
              <div class="col-sm-6 f-16">
                <p class="mb-0 ml-2">Expiry Date</p>
                <p class="ml-2">
                  {{ privateInfo.stripeInfo.month }} /
                  {{ privateInfo.stripeInfo.year }}
                </p>
              </div>
            </div>
            <button class="cancel-btn" @click="deleteClick">Delete</button>
            <button class="edit-btn" @click="editClick">Edit</button>
          </div>
        </div>

        <credit-card
          class="mt-5"
          :stripe="stripe"
          :options="options"
          :privateInfo="privateInfo"
          @card-cancel="cardCanel"
          v-else
        ></credit-card>
      </div>
    </v-main>
  </div>
</template>

<script>
import NavBar from "~/components/NavBar";
import { db, firebase } from "~/plugins/firebase";
import CreditCard from "~/components/CreditCard";
import SettingTab from "~/components/SettingTab.vue";
import DialogConfirm from "~/components/DialogConfirm";
import DialogError from "~/components/DialogError";
import { GET_AUTH_CURRENTUSER } from "~/store/actions_type";
import {
  DELETE_CREDITCARD,
  GET_CURRENT_USER_PRIVATEINFO
} from "~/store/actions_type";
import {
  ApiService,
  currentHostname,
  location,
  TEST_HOSTNAME,
  PRODUCT_HOSTNAME
} from "~/apis/constant_type";

export default {
  data() {
    return {
      items: ["Account", "Credit card", "Bank account"],
      stripe: null,
      options: null
    };
  },
  mounted() {
    this.mountStripe();
    this.getStripeInfo();
  },
  components: {
    NavBar,
    SettingTab,
    CreditCard,
    DialogConfirm,
    DialogError
  },
  methods: {
    async pushCardDelete() {
      console.log(this.privateInfo);

      try {
        await ApiService.deleteCardFromStripe(this.privateInfo, this.$axios);

        await this.$store.dispatch(`auth_module/${DELETE_CREDITCARD}`, {
          privateInfo: this.privateInfo
        });
      } catch (err) {
        this.$refs.dialogErrorRef.showError(err.message);
      }
    },

    mountStripe() {
      console.log(
        "cardinfo bool @@@@@@@ ",
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

    async getStripeInfo() {
      try {
        const authCurrentUser = await this.$store.dispatch(
          `auth_module/${GET_AUTH_CURRENTUSER}`
        );
        if (!authCurrentUser) {
          this.$router.push({ path: `/` });
          return;
        }
        await this.$store.dispatch(
          `auth_module/${GET_CURRENT_USER_PRIVATEINFO}`,
          authCurrentUser.uid
        );
      } catch (err) {
        this.$refs.dialogErrorRef.showError(err.message);
      }
    },

    editClick() {
      this.privateInfo.stripeInfo.last4 = "";
      console.log("edit click ", this.privateInfo.stripeInfo);
    },

    async deleteClick() {
      this.$refs.dialogConfirmRef.deleteCardDialog();
    },
    cardCanel() {
      window.location.reload();
    }
  },
  computed: {
    privateInfo() {
      return this.$store.getters["auth_module/privateInfo"];
    }
  }
};
</script>

<style scoped>
.container-fluid {
  max-width: 620px;
}

.payment-form {
  padding: 2rem;
  background-color: white;
  border: 0.1rem solid #ececec;
}
.payment-form h5 {
  margin: 0;
  padding: 10px;
  font-size: 1.6rem;
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

<template>
  <div>
    <dialog-error ref="dialogErrorRef"></dialog-error>
    <div class="payment-form" v-if="stripe">
      <h3 class="#e0e0e0 grey lighten-4 pa-2">Payment Method</h3>
      <div class="row mt-3">
        <p class="mb-0 ml-3 mr-1">Credit card number</p>
        <v-menu open-on-hover offset-y>
          <template v-slot:activator="{ on }">
            <v-icon v-on="on">mdi-help-circle-outline</v-icon>
          </template>
          <v-card class="mx-auto" max-width="400" tile>
            <v-list>
              <p class="px-5 mb-0">Supported credit cards:</p>
              <v-list-item v-for="(cardItem, i) in cardItems" :key="i">
                <v-img
                  :src="cardItem.url"
                  max-width="36"
                  max-height="36"
                  class="mr-2"
                ></v-img>
                <v-list-item-content>
                  <v-list-item-title
                    v-text="cardItem.brand"
                  ></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </div>
      <card-number
        class="stripe-element card-number"
        ref="cardNumber"
        :stripe="stripe"
        :options="options"
        @change="number = $event.complete"
      />
      <p v-if="saveBtnFlg && !number" class="subtitle-1 red--text mb-0">
        Invalid Card Number
      </p>

      <div class="row">
        <div class="col-sm-6">
          <p class="mb-0 mr-1">Expiration</p>
          <card-expiry
            class="stripe-element card-expiry"
            ref="cardExpiry"
            :stripe="stripe"
            :options="options"
            @change="expiry = $event.complete"
          />
          <p v-if="saveBtnFlg && !expiry" class="subtitle-1 red--text mb-0">
            Invalid Expiry Date
          </p>
        </div>
        <div class="col-sm-6">
          <div class="row">
            <p class="mb-0 ml-3 mr-1">Security code (CVC)</p>
            <v-menu class="mb-0" open-on-hover offset-y>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on">mdi-help-circle-outline</v-icon>
              </template>
              <v-card class="px-3 py-2 mt-2">
                <p>
                  The security code has 3 digits and is
                  <br />located at the back of your credit card.
                </p>
              </v-card>
            </v-menu>
          </div>
          <card-cvc
            class="stripe-element card-cvc"
            ref="cardCvc"
            :stripe="stripe"
            :options="options"
            @change="cvc = $event.complete"
          />
          <p v-if="saveBtnFlg && !cvc" class="subtitle-1 red--text mb-0">
            Invalid Security Code
          </p>
        </div>
      </div>
      <button
        class="delete-btn"
        @click="cancel"
        :loading="loading"
        :disabled="loading"
      >
        Cancel
      </button>
      <button
        class="edit-btn"
        @click="save"
        :loading="loading"
        :disabled="loading"
      >
        Save
      </button>
      <dialog-now-loading :loading="loading"></dialog-now-loading>
    </div>
  </div>
</template>
<script>
import {
  CardNumber,
  CardExpiry,
  CardCvc,
  createToken,
} from "vue-stripe-elements-plus";
import { REGISTER_CREDITCARD } from "~/store/actions_type";
import DialogError from "~/components/DialogError";
import { ApiService } from "~/apis/constant_type";
import DialogNowLoading from "~/components/DialogNowLoading";
import axios from "axios";

export default {
  props: ["stripe", "options", "privateInfo"],
  data() {
    return {
      loading: false,
      saveBtnFlg: false,
      complete: false,
      number: false,
      expiry: false,
      cvc: false,
      dialog: false,
      cardItems: [
        {
          url: "https://cdn-images-1.medium.com/proxy/1*0d40297wdAUwEkxSXQjBoQ.png",
          brand: "VISA",
        },
        {
          url: "https://cdn-images-1.medium.com/proxy/1*pkLRUgj9PI_snp1LBC8FYQ.png",
          brand: "Master Card",
        },
      ],
    };
  },
  components: {
    CardNumber,
    CardExpiry,
    CardCvc,
    DialogError,
    DialogNowLoading,
  },
  methods: {
    async save() {
      try {
        this.saveBtnFlg = true;

        if (!this.complete) {
          return;
        }
        this.loading = true;

        var customerId = this.privateInfo.stripeInfo.customerId;
        // console.log(this.privateInfo.stripeInfo.customerId);
        // console.log(this.privateInfo.stripeInfo.last4);
        // console.log(this.privateInfo.stripeInfo.year);

        //
        if (!customerId) {
          console.log("111111111111");
          customerId = await this.createCustomer();
        } else if (this.privateInfo.stripeInfo.year) {
          //すでにカードをstripeに登録してる場合は、削除してから、新しくカードを登録する。
          console.log("222222222222");
          await ApiService.deleteCardFromStripe(this.privateInfo, this.$axios);
        }
        console.log("333333333333");
        const data = await createToken();
        await this.createCard(data.token, customerId);

        // this.$emit("save-card", cardData);
      } catch (err) {
        this.$refs.dialogErrorRef.showError(err.message);
      } finally {
        this.loading = false;
      }
    },
    cancel() {
      this.$emit("card-cancel");
    },
    closeDialogEmit(btnName, cardData) {
      this.$emit("dialog-close", { btnName, cardData });
    },

    async createCustomer() {
      // debugger;
      let response = await this.$axios.$post(
        "https://us-central1-blog-test01-ec54b.cloudfunctions.net/api/stripe_create_customer",
        {
          email: this.privateInfo.email,
        }
      );
      console.log(this.privateInfo.email);
      console.log(response.customerId);

      return response.customerId;
    },

    async createCard(token, customerId) {
      let response = await axios.post("/api/stripe_create_card", {
        customerId: customerId,
        token: token,
      });
      await this.registerCardToFireStore(response.card);
      return;
    },

    update() {
      this.complete = this.number && this.expiry && this.cvc;
      // field completed, find field to focus next
      if (this.number) {
        if (!this.expiry) {
          this.$refs.cardExpiry.focus();
        } else if (!this.cvc) {
          this.$refs.cardCvc.focus();
        }
      } else if (this.expiry) {
        if (!this.cvc) {
          this.$refs.cardCvc.focus();
        } else if (!this.number) {
          this.$refs.cardNumber.focus();
        }
      }
    },

    async registerCardToFireStore(card) {
      console.log(card, this.privateInfo);
      await this.$store.dispatch(`auth_module/${REGISTER_CREDITCARD}`, {
        privateInfo: this.privateInfo,
        card: card,
      });
      return;
    },
  },
  watch: {
    number() {
      this.update();
    },
    expiry() {
      this.update();
    },
    cvc() {
      this.update();
    },
    loading(val) {
      if (!val) return;

      setTimeout(() => (this.loading = false), 10000);
    },
  },
};
</script>

<style scoped>
/* .credit-card-inputs.complete {
  border: 2px solid green;
} */

p {
  font-size: 1.6rem;
}

.card-number,
.card-expiry,
.card-cvc {
  border: 1px solid black;
  /* background: grey; */
  padding: 5px;
}
.payment-form {
  padding: 2rem;
  background-color: white;
  border: 0.1rem solid #ececec;
}
.payment-form h5 {
  margin: 0;
  padding: 10px;
  font-size: 1.2rem;
}

.delete-btn {
  border: 2px solid lightgray;
  border-radius: 10px;
  padding: 5px;
  width: 100px;
  padding: 10px;
  font-size: 18px;
  margin-top: 15px;
}
.edit-btn {
  float: right;
  border: 2px solid lightgray;
  border-radius: 10px;
  padding: 5px;
  width: 100px;
  padding: 10px;
  color: white;
  font-size: 18px;
  background-color: #2cb696;
  margin-top: 15px;
}

@media (max-width: 576px) {
  /* p {
    font-size: 1rem;
  } */
}
</style>

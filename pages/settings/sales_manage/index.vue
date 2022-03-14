<template>
  <div>
    <nav-bar></nav-bar>
    <v-main>
      <dialog-error ref="dialogErrorRef"></dialog-error>
      <dialog-confirm ref="dialogConfirmRef"></dialog-confirm>
      <div class="container-fluid px-5 py-5 mx-auto">
        <setting-tab></setting-tab>
        <div>
          <div class="sale-unpaid-detail my-5">
            <p class="sale-unpaid-head mt-5">Payout</p>

            <div class="transfer-overview mt-12">
              <p class="mb-1 f-12"></p>
              <!-- <v-text-field
                v-model="applyAmount"
                label="The amount you can get paid."
                outlined
                prefix="$"
                autofocus
                :rules="[rules.required, rules.number]"
              ></v-text-field> -->

              <div class="section-1 mt-5">
                <p class="f-18">net sales</p>
                <p class="f-20" style="font-weight: bold;">
                  <span v-if="depositAmount === 0">-----</span>
                  <span v-else>${{ depositAmount }}</span>
                </p>
                <v-btn
                  class="show-details text-capitalize"
                  small
                  outlined
                  to="/settings/sales_manage/details"
                  nuxt
                  >Details</v-btn
                >
              </div>
            </div>
            <div style="clear: both;"></div>

            <div style="text-align: center;">
              <p class="f-12">
                The smallest amount you can get paid is
                <span style="font-weight: bold;"
                  >{{ MIN_AMOUNT_TO_GET_PAID }} USD.</span
                >
              </p>
              <p class="f-12">
                You can get paid up to twice a month.
              </p>

              <v-btn
                class="text-capitalize my-10"
                rounded
                color="success"
                x-large
                dark
                @click="applyTransfer"
                ><span class="f-20">Be Paid</span></v-btn
              >
            </div>
          </div>
        </div>

        <dialog-applied-money
          ref="dialogAppliedMoneyRef"
        ></dialog-applied-money>
      </div>
    </v-main>
  </div>
</template>

<script>
import NavBar from "~/components/NavBar";
import SettingTab from "~/components/SettingTab.vue";
import TransferSalesTable from "~/components/TransferSalesTable";
import DialogAppliedMoney from "~/components/DialogAppliedMoney";
import DialogConfirm from "~/components/DialogConfirm";
import DialogError from "~/components/DialogError";
import {
  FETCH_TRANSFERS,
  GET_CURRENT_USER_PRIVATEINFO,
  GET_TOTAL_SALES_PROFIT_AMOUNT,
  GET_AUTH_CURRENTUSER
} from "~/store/actions_type";
import { TransferService } from "~/apis/transfer_service";
import {
  UNAPPLIED,
  APPLIED,
  ERROR_APPLY_UNDERMONEY,
  ERROR_APPLY_NOBANK,
  MIN_AMOUNT_TO_GET_PAID,
  ERROR_APPLY_OVERMONEY
} from "~/apis/constant_type";
import InsertGistVue from "~/components/Editor/Embed/InsertGist.vue";

export default {
  data() {
    return {
      UNAPPLIED: UNAPPLIED,
      APPLIED: APPLIED,
      MIN_AMOUNT_TO_GET_PAID: MIN_AMOUNT_TO_GET_PAID,
      applyAmount: "",
      rules: {
        required: value => !!value || "Required.",
        // counter: value => value.length <= 3 || "Max 3 characters",
        number: value => {
          return (
            /^\d*$/.test(
              value
            ) /* && (value === "" || parseInt(value) <= 500)*/ ||
            "Invalid number."
          );
        }
      },
      currentMonthNoData: {
        year: "",
        month: "",
        finalDay: ""
      }
    };
  },
  async mounted() {
    await this.getAuthCurrentUser();
    this.fetchTransfers();
  },
  components: {
    NavBar,
    SettingTab,
    // TransferSalesTable,
    DialogConfirm,
    DialogError,
    DialogAppliedMoney
  },
  methods: {
    async getAuthCurrentUser() {
      try {
        const authCurrentUser = await this.$store.dispatch(
          `auth_module/${GET_AUTH_CURRENTUSER}`
        );
        if (!authCurrentUser) {
          this.$router.push({ path: `/` });
          return;
        }
      } catch (err) {
        this.$refs.dialogErrorRef.showError(err.message);
      }
    },
    async fetchTransfers() {
      await this.$store.dispatch(
        `transfer_module/${GET_TOTAL_SALES_PROFIT_AMOUNT}`,
        {
          currentUid: this.currentUid
        }
      );
      //
    },
    showDetailDialog(monthlyData) {
      this.$refs.dialogAppliedMoneyRef.showDetailDialog(monthlyData);
    },

    async applyTransfer() {
      console.log("applyTransfer11: ", this.depositAmount);

      let isError = await this.checkError();
      if (isError) return;

      console.log(
        this.depositAmount,
        typeof this.depositAmount,
        this.applyAmount,
        typeof this.applyAmount
      );

      this.$refs.dialogAppliedMoneyRef.applyTransferDialog(this.depositAmount);
    },
    async checkError() {
      let isError = false;

      const applyAmount = Number(this.depositAmount);
      const appliedNumberOfTimes = await TransferService.getHowManyTimesAppliedInCurrentMonth(
        this.currentUid
      );

      if (isNaN(applyAmount)) {
        isError = true;
      } else if (!applyAmount || this.applyAmount.charAt(0) === "0") {
        let that = this;
        that.applyAmount = 0;
        setTimeout(async () => {
          that.applyAmount = "";
        });
        isError = true;
      } else if (applyAmount > this.depositAmount) {
        this.$refs.dialogAppliedMoneyRef.showErrorDialog(ERROR_APPLY_OVERMONEY);
        isError = true;
      }
      // else if (appliedNumberOfTimes > 2) {
      //   this.$refs.dialogAppliedMoneyRef.showErrorDialog(
      //     ERROR_APPLY_LIMIT_TIMES
      //   );
      //   isError = true;
      // }
      else if (applyAmount < 10) {
        console.log("a !!");
        this.$refs.dialogAppliedMoneyRef.showErrorDialog(
          ERROR_APPLY_UNDERMONEY
        );
        isError = true;
      } else {
        console.log("b !!");
        let privateInfo = await this.$store.dispatch(
          `auth_module/${GET_CURRENT_USER_PRIVATEINFO}`,
          this.currentUid
        );
        console.log(privateInfo.bank.accountNumber, privateInfo.bank.swiftCode);
        // if (!privateInfo.bank.accountNumber && !privateInfo.bank.swiftCode) {
        //   this.$refs.dialogAppliedMoneyRef.showErrorDialog(ERROR_APPLY_NOBANK);

        //   isError = true;
        //   this.$refs.dialogAppliedMoneyRef.showErrorDialog("noBankAccount");
        // }
      }
      return isError;
    }
  },
  computed: {
    depositAmount() {
      const depositAmount = this.$store.getters[
        "transfer_module/depositAmount"
      ];
      return depositAmount;
    },
    currentUid() {
      const currentUid = this.$store.getters["auth_module/currentUid"];
      return currentUid;
    }
  }
};
</script>

<style scoped>
.container-fluid {
  max-width: 620px;
}
.sale-unpaid-head {
  text-align: center;
  font-size: 24px;
}
.sale-unpaid-detail {
  border: 3px solid #f2f2f2;
}
.transfer-overview {
  margin: 30px;
}
.transfer-overview-left {
  float: left;
  text-align: left;
  width: 33.33333%;
  font-size: 16px;
}
.transfer-overview-center {
  color: #2cb696;
  float: left;
  text-align: center;
  width: 33.33333%;
  font-size: 20px;
  font-weight: bold;
}
.transfer-overview-right {
  float: left;
  text-align: right;
  width: 33.33333%;
  font-size: 14px;
  font-weight: bold;
  color: #2db696;
  /* text-decoration: underline; */
}
.m-salesThisMonth__summary {
  margin: 30px 0;
  line-height: 300%;
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  background-color: #2cb696;
  border-radius: 4px;
}
.m-salesThisMonth__summaryLabel {
  font-size: 2rem;
  color: white;
}
.m-salesThisMonth__summaryAmount {
  font-size: 2rem;
  color: white;
}
.m-salesThisMonth__summaryDetail {
  font-size: 1.4rem;
  background-color: white;
  color: #2cb696;
  padding: 0 1.6rem;
  border-radius: 0.4rem;
  outline: none;
}
.section-1 {
  font-size: 14px;
  display: flex;
  justify-content: space-between;
}
.show-details {
  font-size: 14px;
  font-weight: bold;
  color: #2db696;
}
</style>

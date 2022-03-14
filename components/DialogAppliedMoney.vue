<template>
  <div class="my-2">
    <!-- <v-dialog v-model="detailDialogFlg" max-width="400px">
      <div>
        <v-card>
          <div class="pa-5">
            <div class="mb-5 mt-2">
              <v-btn class="right" icon @click="detailDialogFlg = false">
                <v-icon large color="blue">mdi-close</v-icon>
              </v-btn>

              <span class="span-text" v-if="selectedMonthlyData">
                {{ selectedMonthlyData.soldMonthStr }} in
                {{ selectedMonthlyData.soldYear }}</span
              >
            </div>
            <v-divider></v-divider>
            <v-list>
              <template v-for="(moneyTransfer, index) in moneyTransfers">
                <v-list-item :key="`first-${index}`">
                  <v-list-item-content>
                    <v-list-item-title
                      ><span
                        class="span-list-title"
                        @click="goToDetailPost(moneyTransfer.post)"
                        >{{ moneyTransfer.post.title }}</span
                      ></v-list-item-title
                    >
                    <v-list-item-subtitle
                      ><span
                        class="span-list-text"
                        @click="goToDetailPost(moneyTransfer.post)"
                        >${{ moneyTransfer.soldPrice }}</span
                      ></v-list-item-subtitle
                    >
                    <v-list-item-subtitle
                      ><span
                        class="span-list-text"
                        @click="goToDetailPost(moneyTransfer.post)"
                        >Sold on {{ moneyTransfer.date }}</span
                      ></v-list-item-subtitle
                    >
                  </v-list-item-content>
                </v-list-item>
                <v-divider :key="`second-${index}`"></v-divider>
              </template>
            </v-list>
          </div>
        </v-card>
      </div>
    </v-dialog> -->
    <v-dialog v-model="applyDialogFlg" :persistent="true" max-width="600px">
      <v-card class="px-10">
        <p
          class="f-20 text-center pt-5"
          style="color: #2DB696; font-weight: bold;"
        >
          ${{ applyAmount }}
        </p>
        <v-divider></v-divider>
        <p class="f-16 text-center mt-5 ">
          Apply to be paid with the above amount
        </p>

        <v-divider></v-divider>

        <v-card-actions class="pa-5">
          <v-btn
            depressed
            outlined
            color="#a8a8a8"
            width="150px"
            class="mr-5 text-capitalize"
            @click="applyDialogFlg = false"
            ><span class="f-16">Cancel</span></v-btn
          >
          <v-spacer></v-spacer>

          <v-btn
            class="text-capitalize payline-title"
            dark
            color="#2DB696"
            width="150px"
            @click="applyTransferMoney"
            ><span class="f-16">Apply</span></v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="confirmDialogFlg"
      :persistent="confirmDialogPersistent"
      max-width="580"
    >
      <v-card>
        <h1 class="pt-10 display-2 text-center">{{ confirmTitle }}</h1>
        <br />

        <p
          class="f-20 text-center"
          style="white-space:pre-wrap; word-wrap:break-word; line-height: 1.5;"
        >
          {{ confirmDescription }}
        </p>
        <br />
        <br />
        <v-layout justify-center>
          <v-btn
            dark
            class="text-capitalize"
            color="#2DB696"
            width="100px"
            @click="pushConfirmBtn"
            ><span class="f-16">{{ confirmAgreeText }}</span></v-btn
          >
        </v-layout>
        <br />
      </v-card>
    </v-dialog>
    <!-- <v-dialog v-model="errorDialog" max-width="500">
      <v-card>
        <v-card-title class="display-2" style="color: red;">{{
          errorTitle
        }}</v-card-title>
        <v-card-text
          ><span class="f-18" style="line-height: 1.5">{{
            errorDescription
          }}</span></v-card-text
        >
        <v-card-actions class="pa-5">
          <v-btn dark width="100px" color="#2DB696" @click=""
            ><span class="f-16">{{ errorAgreeText }}</span></v-btn
          >
          <v-btn dark color="#2DB696" @click="triggerClick(methodName)"
            >OK</v-btn
          > 
        </v-card-actions>
      </v-card>
    </v-dialog> -->
  </div>
</template>

<script>
import { TransferService } from "~/apis/transfer_service";
import { FETCH_MONTHLY_TRANSFERS, APPLY_TRANSFER } from "~/store/actions_type";
import {
  MIN_AMOUNT_TO_GET_PAID,
  ERROR_APPLY_UNDERMONEY,
  ERROR_APPLY_NOBANK,
  ERROR_APPLY_LIMIT_TIMES,
  ERROR_APPLY_OVERMONEY
} from "~/apis/constant_type";

export default {
  // props: ["selectedSaleMonthlyData", "selectedMonthlyTransfers", "dialog"],
  data() {
    return {
      detailDialogFlg: false,
      applyDialogFlg: false,
      selectedMonthlyData: null,
      unPaidTotalAmount: 0,
      monthlyUnpaidTransferDatas: null,
      confirmDialogFlg: false,
      confirmTitle: "",
      confirmDescription: "",
      confirmAgreeText: "",
      confirmType: "",
      confirmDialogPersistent: false,
      SUCCESSDIALOG: "successDialog",
      applyAmount: 0
    };
  },
  methods: {
    showDetailDialog(monthlyData) {
      this.selectedMonthlyData = monthlyData;

      this.detailDialogFlg = true;
    },
    goToDetailPost(post) {
      this.$router.push({ path: `/n/${post.slug}` });
    },
    async applyTransferDialog(applyAmount) {
      console.log("1@ ", applyAmount);
      this.applyAmount = applyAmount;
      this.applyDialogFlg = true;
    },
    showErrorDialog(type) {
      if (type === ERROR_APPLY_OVERMONEY) {
        this.confirmType = ERROR_APPLY_OVERMONEY;
        this.confirmTitle = "Error";
        this.confirmDescription = `Your sales are only ${this.depositAmount} USD.`;
        this.confirmAgreeText = "OK";
      } else if (type === ERROR_APPLY_LIMIT_TIMES) {
        this.confirmType = ERROR_APPLY_LIMIT_TIMES;
        this.confirmTitle = "Error";
        this.confirmDescription = `You can get paid up to twice a month. 
        Plase apply after next month.`;
        this.confirmAgreeText = "OK";
      } else if (type === ERROR_APPLY_UNDERMONEY) {
        this.confirmType = ERROR_APPLY_UNDERMONEY;
        this.confirmTitle = "Error";
        this.confirmDescription = `The smallest amount you can get paid is ${MIN_AMOUNT_TO_GET_PAID} USD.`;
        this.confirmAgreeText = "OK";
      } else if (type === ERROR_APPLY_NOBANK) {
        this.confirmType = ERROR_APPLY_NOBANK;
        this.confirmTitle = "Error";
        this.confirmDescription =
          "You need to register your bank account to transfer money.";
        this.confirmAgreeText = "Register";
      }
      this.confirmDialogFlg = true;
    },
    async applyTransferMoney() {
      // let unAppliedAllMoneyTransfers = await TransferService.queryUnAppliedAllTransfers(
      //   currentUser.uid
      // );

      // console.log("1: ", unAppliedAllMoneyTransfers);

      await this.$store.dispatch(`transfer_module/${APPLY_TRANSFER}`, {
        applyAmount: this.applyAmount,
        currentUid: this.currentUid
      });

      console.log("4");
      this.showSuccessDialog();
    },
    showSuccessDialog() {
      this.applyDialogFlg = false;
      this.confirmDialogPersistent = true;
      this.confirmType = this.SUCCESSDIALOG;
      this.confirmTitle = "Success";
      this.confirmDescription = "We will transfer money to your bank account.";
      this.confirmAgreeText = "OK";
      this.confirmDialogFlg = true;
    },
    pushConfirmBtn() {
      switch (this.confirmType) {
        case ERROR_APPLY_UNDERMONEY:
        case ERROR_APPLY_LIMIT_TIMES:
        case ERROR_APPLY_OVERMONEY:
          this.confirmDialogFlg = false;
          break;
        case ERROR_APPLY_NOBANK:
          this.confirmDialogFlg = false;
          this.$router.push({ path: `/settings/bank_account` });
          break;
        case this.SUCCESSDIALOG:
          this.reloadWindow();
          break;
        default:
          console.log("それ以外よんだよ。 @@@@@@@@@@@@@@@@@@");
          break;
      }
    },
    reloadWindow() {
      window.location.reload();
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
.span-text {
  font-size: 1.6rem;
}
.right {
  float: right;
}
.span-list-title {
  font-size: 1.6rem;
  font-weight: bold;
  cursor: pointer;
}
.span-list-text {
  font-size: 1.4rem;
  cursor: pointer;
}
</style>

<template>
  <div>
    <sidebar-help></sidebar-help>
    <v-main>
      <div class="px-5 py-10 mx-auto" style="max-width: 850px;">
        <h1 class="display-3 font-weight-bold">
          Getting Paid by Publista
        </h1>
        <p class="mt-10 f-18">
          Publista enables creators to sell directly to their audience. When
          your customers use a credit card on a purchase, the money sits in your
          balance. After you
          <a
            href="/help/how_get_paid"
            target="_blank"
            style="text-decoration: none;"
          >
            apply to get paid</a
          >, your net sales are sent to you. After we have taken
          <span class="font-weight-bold">our fee (12.5% + $0.30)</span>
          from each of your sales (we charge those fees per sale, not on the
          lump sum of your sales) and we have taken
          <span class="font-weight-bold">a processing fee (3% + $1)</span>, your
          net sales will be sent in their entirety to your bank account.
        </p>

        <h2 class="display-2 font-weight-bold" style="margin-top: 80px;">
          Publista's fees
        </h2>
        <p class="f-18 mt-5">
          The fee we take on each sale is
          <span class="font-weight-bold"
            >{{ COMMISSION_RATE }}% + ${{ FIXED_FEE }}0 (USD)</span
          >
          per sale. That’s all we charge you. We take out fees only on sales
          greater than $0. In other words, if you are processing money on a
          sale, then we are taking a fee. If you don't make money (i.e. if your
          article is free), then we don't make money.
        </p>

        <p class="f-18 mt-5">
          We transfer money to your bank account with
          <a
            href="https://wise.com"
            target="_blank"
            style="text-decoration: none;"
          >
            TransferWise</a
          >.
          <br />
          We'll charge
          <span class="font-weight-bold"
            >a processing fee ({{ PROCESSING_RATE }}% + ${{
              PROCESSING_FIXED_FEE
            }})
          </span>
          to transfer money.
        </p>

        <h2 class="display-2 font-weight-bold" style="margin-top: 80px;">
          Currency
        </h2>
        <p class="f-18 mt-5">
          We will pay you in your local currency. For example, if you live in
          Canada, you receive your payment in CAD.
        </p>
        <h2 class="display-2 font-weight-bold" style="margin-top: 80px;">
          Setting up your payouts and your first payout
        </h2>
        <p class="f-18 mt-5">
          All of your payout details can be found and edited by going to your
          Payout Settings.
        </p>
        <p class="f-18">
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
        <h2 class="display-2 font-weight-bold" style="margin-top: 80px;">
          We use
          <a
            href="https://wise.com"
            target="_blank"
            style="text-decoration: none;"
          >
            TransferWise
          </a>
          to transfer money to you.
        </h2>
        <p class="f-18 mt-5">
          We are based in Japan, so we pay you with
          <a
            href="https://wise.com"
            target="_blank"
            style="text-decoration: none;"
          >
            TransferWise</a
          >. You have to live (yes, actually live) in the USA, UK, Canada, or
          Australia. You will need to provide your bank account number and your
          routing number (or SWIFT code). If you live in other countries, please
          <a
            href="/help/contactus"
            target="_blank"
            style="text-decoration: none;"
            class="font-weight-bold"
          >
            contact us</a
          >.
        </p>
        <h2 class="display-2 font-weight-bold" style="margin-top: 80px;">
          Risk Review
        </h2>
        <p class="f-18 mt-5">
          Before you can be paid out, your account has to be reviewed. The
          review process can sometimes take a few weeks, depending on how many
          sales you have and the data we can glean from them. Every account's
          situation is unique so we can't unfortunately provide any general
          timelines for all creators. Thanks in advance for your patience - we
          know the waiting can be harrowing! In order to continue working with
          our banking partners (in other words, exist as a business), we have to
          ensure that we are sending money to legitimate creators who don't have
          suspicious purchases. We ask that you please don't buy your own
          products to "test" the payout system. If your account has been marked
          as suspicious by our Risk team, you cannot be paid.
        </p>
        <br />
        <br /><br /><br />
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
  MIN_AMOUNT_TO_GET_PAID
} from "~/apis/constant_type";
export default {
  data() {
    return {
      COMMISSION_RATE: COMMISSION_RATE,
      FIXED_FEE: FIXED_FEE,
      PROCESSING_RATE: PROCESSING_RATE,
      PROCESSING_FIXED_FEE: PROCESSING_FIXED_FEE,
      MIN_AMOUNT_TO_GET_PAID: MIN_AMOUNT_TO_GET_PAID
    };
  },
  components: {
    SidebarHelp,
    Footer
  }
};
</script>

<style scoped></style>

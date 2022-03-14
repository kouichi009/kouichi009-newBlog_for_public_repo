<template>
  <div>
    <input required pattern="[+-]?\$?\d+(,\d{3})*(\.\d+)?%?" type="text" />
    <h1 class="ma-5">tests</h1>
    <h1 class="ma-5" @click="cal">calculation</h1>
    <h1 class="ma-5" @click="cal2">calculation 2</h1>
    <h1 class="ma-5" @click="cal3">calculation 3</h1>
    <h1 class="ma-5" @click="cal4">calculation 4</h1>
    <h1 class="ma-5" @click="cal5">calculation 5</h1>
    <h1 class="ma-5" @click="cal6">calculation 6</h1>
    <h1 class="ma-5" @click="cal7">calculation 7</h1>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {};
  },

  mounted() {
    console.log("tests mounted1");
    // const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    // const postId = post.id;
    // const uid = post.user.uid;
    // const salePrice = Number(post.price);
    // const commissionRate = COMMISSION_RATE / 100;
    // const commissionPrice = Math.floor(salePrice * commissionRate);
    // const profit = salePrice - commissionPrice;
    // rules: {
    //     required: value => !!value || "Required.",
    //     counter: value => value.length <= 3 || "Max 3 characters",
    //     number: value => {
    //       return (
    //         (/^\d*$/.test(value) && (value === "" || parseInt(value) <= 500)) ||
    //         "Invalid number."
    //       );
    //     }
    //   },
  },
  methods: {
    cal() {
      // let regex = /^[-+]?(?:[0-9]+,)*[0-9]+(?:\.[0-9]+)?$/;
      // let regex = /^(?:\+|\-|\$)?\d{1,}(?:\,?\d{3})*(?:\.\d+)?%?/;
      let regex = /^\s*-?[1-9]\d*(\.\d{1,2})?\s*$/;
      console.log("regex: ", regex.test("50000009.000"));
    },
    cal2() {
      let salePrice = 1;
      salePrice = Number(salePrice);
      const commissionRate = 15 / 100;
      // const commissionPrice = Math.floor(salePrice * commissionRate);
      const commissionPrice = salePrice * commissionRate;
      const profit = salePrice - commissionPrice;
      console.log(
        "calculation2: ",
        profit,
        salePrice,
        commissionPrice,
        "commissionRate: ",
        commissionRate,
        typeof commissionRate
      );
    },
    cal3() {
      let salePrice = 1;
      // salePrice = salePrice - 0.3;
      salePrice = Number(salePrice);
      const commissionRate = 23 / 100;
      // const commissionPrice = Math.floor(salePrice * commissionRate);
      const commissionPrice = salePrice * commissionRate;
      const profit = salePrice - commissionPrice;
      console.log(
        "calculation2: ",
        profit,
        salePrice,
        commissionPrice,
        "commissionRate: ",
        commissionRate,
        typeof commissionRate
      );
    },
    cal4() {
      let salePrice = 1;
      salePrice = salePrice;
      salePrice = Number(salePrice);
      const commissionRate = 20 / 100;
      const commissionPrice = Math.round(salePrice * commissionRate);
      // const commissionPrice = salePrice * commissionRate;
      const profit = salePrice - commissionPrice;
      console.log(
        "calculation2: ",
        profit,
        salePrice,
        commissionPrice,
        "commissionRate: ",
        commissionRate,
        typeof commissionRate
      );
    },
    cal5() {
      const num = 12.2627;

      // 小数第二位以下を切り捨て
      console.log(Math.floor(num * 10) / 10); // 12.2

      // 小数第三位以下を切り捨て
      console.log(Math.floor(num * 100) / 100); // 12.26
    },
    cal6() {
      let num = 12.2627;
      num = num + 0.3;
      // 小数第二位以下を切り捨て
      console.log(Math.floor(num * 10) / 10); // 12.2

      // 小数第三位以下を切り捨て
      console.log(Math.floor(num * 100) / 100); // 12.26

      console.log(num); // 12.2
      let salePrice = 1 - 0.3;
      salePrice = salePrice;
      salePrice = Number(salePrice);
      const commissionRate = 20 / 100;
      // const commissionPrice = Math.round(salePrice * commissionRate);
      let commissionPrice = salePrice * commissionRate;
      commissionPrice = Math.floor(commissionPrice * 100) / 100;
      const profit = salePrice - commissionPrice;
      console.log(
        "calculation2: ",
        profit,
        salePrice,
        commissionPrice,
        "commissionRate: ",
        commissionRate,
        typeof commissionRate
      );
    },
    cal7() {
      let num = 12.2627;
      num = num + 0.3;
      // 小数第二位以下を切り捨て
      console.log(Math.floor(num * 10) / 10); // 12.2

      // 小数第三位以下を切り捨て
      console.log(Math.floor(num * 100) / 100); // 12.26

      console.log(num); // 12.2

      ////////////////////////////////////////////////////////////////////////////////
      let salePrice = 3.27;
      salePrice = salePrice + 3.87;
      salePrice = salePrice + 3.87;
      salePrice = salePrice + 1;
      // salePrice = 1;

      salePrice = Number(salePrice);
      const commissionRate = 12.5 / 100;
      let commissionPrice = salePrice * commissionRate;
      // commissionPrice = Math.floor(commissionPrice * 100) / 100;
      let profit = salePrice - commissionPrice;

      let test = profit - 0.3;
      test = Math.floor(test * 100) / 100;
      // debugger;

      console.log(
        "calculation 7: ",
        profit,
        salePrice,
        commissionPrice,
        "commissionRate: ",
        commissionRate,
        typeof commissionRate,
        test,
        typeof test
      );
    }
  },

  computed: {}
};
</script>

<style></style>

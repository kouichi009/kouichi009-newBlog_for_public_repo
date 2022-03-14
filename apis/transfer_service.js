import { db, firebase } from "~/plugins/firebase";
import {
  COMMISSION_RATE,
  FIXED_FEE,
  SOLD_DATE_AT,
  DESC,
  ApiService
} from "~/apis/constant_type";

import { PostService } from "~/apis/post_service";

import moment from "moment";

export const TransferService = {
  async getTotalSalesProfitAmount(currentUid) {
    const salesCollection = db
      .collection("users")
      .doc(currentUid)
      .collection("totalSalesAmount")
      .doc(currentUid)
      .collection("sales");

    const appliesCollection = db
      .collection("users")
      .doc(currentUid)
      .collection("totalSalesAmount")
      .doc(currentUid)
      .collection("applies");

    const salesQuerySnapshot = await salesCollection.get();
    let totalProfitAmount = 0;
    await Promise.all(
      salesQuerySnapshot.docs.map(async doc => {
        let sale = doc.data();
        totalProfitAmount = totalProfitAmount + sale.profitAmount;
        debugger;
      })
    );

    const appliesQuerySnapshot = await appliesCollection.get();
    await Promise.all(
      appliesQuerySnapshot.docs.map(async doc => {
        let applies = doc.data();
        totalProfitAmount = totalProfitAmount - applies.appliedAmount;
        debugger;
      })
    );
    totalProfitAmount = Math.floor(totalProfitAmount * 100) / 100; // 小数点第２まで表示、第３以降を切り捨てる。

    if (totalProfitAmount < 0.1) {
      totalProfitAmount = 0;
    }

    return totalProfitAmount;
  },

  async create(batch, post, currentUid) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    const postId = post.id;
    const uid = post.user.uid;
    const salePrice = Number(post.price);
    const commissionRate = COMMISSION_RATE / 100;
    const commissionPrice = salePrice * commissionRate;
    let profit = salePrice - commissionPrice;
    console.log(typeof profit);

    debugger;
    profit = profit - FIXED_FEE;
    console.log(typeof profit, FIXED_FEE, typeof FIXED_FEE);
    debugger;
    profit = Math.floor(profit * 100) / 100; // 小数点第２まで表示、第３以降を切り捨てる。
    console.log(typeof profit);

    debugger;
    let { year, month, day } = this.getCurrentYearMonthDay();

    const saleId = db
      .collection("users")
      .doc(uid)
      .collection("totalSalesAmount")
      .doc(uid)
      .collection("sales")
      .doc().id;

    let saleCollection = db
      .collection("users")
      .doc(uid)
      .collection("totalSalesAmount")
      .doc(uid)
      .collection("sales")
      .doc(saleId);

    let sale = {
      id: saleId,
      from: currentUid,
      to: uid,
      postId: postId,
      type: "sale",
      soldPrice: salePrice,
      profitAmount: profit,
      soldDateAt: timestamp,
      soldYear: year,
      soldMonth: month,
      fixedFee: FIXED_FEE,
      commissionRate: commissionRate // プラットフォーム手数料20%
    };

    console.log(
      // post,
      // year,
      // month,
      // sale,
      commissionRate,
      salePrice,
      profit,
      commissionPrice,
      typeof profit,
      typeof FIXED_FEE,
      FIXED_FEE
    );
    batch.set(saleCollection, sale);

    return;
  },

  async applyTransfer(applyAmount, currentUid) {
    applyAmount = Number(applyAmount);
    applyAmount = Math.floor(applyAmount * 100) / 100; // 小数点第２まで表示、第３以降を切り捨てる。
    console.log(applyAmount);
    debugger;

    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    let batch = db.batch();

    let totalSalesAmountRef = db
      .collection("users")
      .doc(currentUid)
      .collection("totalSalesAmount")
      .doc(currentUid);

    // batch.update(totalSalesAmountRef, {
    //   totalApplyAmount: firebase.firestore.FieldValue.increment(applyAmount),
    //   appliedDateAt: timestamp
    // });

    let { year, month, day } = this.getCurrentYearMonthDay();
    const applyId = db
      .collection("users")
      .doc(currentUid)
      .collection("totalSalesAmount")
      .doc(currentUid)
      .collection("applies")
      .doc().id;

    let applyCollection = db
      .collection("users")
      .doc(currentUid)
      .collection("totalSalesAmount")
      .doc(currentUid)
      .collection("applies")
      .doc(applyId);

    let apply = {
      id: applyId,
      uid: currentUid,
      appliedAmount: applyAmount,
      appliedDateAt: timestamp,
      appliedYear: year,
      appliedMonth: month,
      status: 1
    };

    batch.set(applyCollection, apply);

    await batch.commit();
    return;
  },

  async fetchSalesPosts(currentUid) {
    const salesCollection = db
      .collection("users")
      .doc(currentUid)
      .collection("totalSalesAmount")
      .doc(currentUid)
      .collection("sales");

    const salesQuerySnapshot = await salesCollection.get();

    var salesPosts = [];
    await Promise.all(
      salesQuerySnapshot.docs.map(async doc => {
        let salePost = doc.data();
        var post = await PostService.getPostFromId(salePost.postId);
        const soldDate = ApiService.getDate(salePost.soldDateAt);
        salePost.soldDate = "Sold on " + soldDate;
        salePost.post = post;

        salesPosts.push(salePost);
      })
    );
    salesPosts.sort(function(a, b) {
      return b.soldDateAt - a.soldDateAt;
    });
    console.log("salesPosts@@@@@@@@: ", salesPosts);

    return salesPosts;
  },

  async getHowManyTimesAppliedInCurrentMonth(currentUid) {
    let { year, month, day } = this.getCurrentYearMonthDay();
    console.log("getHowManyTimesAppliedInCurrentMonth ", year, month, day);
    var appliesCollection = db
      .collection("users")
      .doc(currentUid)
      .collection("totalSalesAmount")
      .doc(currentUid)
      .collection("applies")
      .where("appliedYear", "==", year)
      .where("appliedMonth", "==", month);
    const appliesQuerySnapshot = await appliesCollection.get();
    const appliedNumberOfTimes = appliesQuerySnapshot.size;

    return appliedNumberOfTimes;
  },

  getCurrentYearMonthDay() {
    const timestampNow = firebase.firestore.Timestamp.now();
    console.log("timestampNow: ", timestampNow);
    const seconds = timestampNow.seconds;
    let myDate = new Date(seconds * 1000);
    let year = Number(moment(myDate, "x").format("Y"));
    let month = Number(moment(myDate, "x").format("M"));
    let day = Number(moment(myDate, "x").format("D"));

    return { year, month, day };
  },
  concatYearMonth(year, month) {
    return year + "_" + month;
  },
  getConcatCurrentYearMonth() {
    const timestampNow = firebase.firestore.Timestamp.now();
    let { year, month, day } = this.getCurrentYearMonthDay(timestampNow);
    let currentYearMonth = this.concatYearMonth(year, month); // 2021_3

    console.log(
      year,
      month,
      day,
      currentYearMonth,
      typeof year,
      typeof month,
      typeof day,
      typeof currentYearMonth
    );

    return { currentYearMonth, year, month };
  }
};

//config environment
require("dotenv").config();

// const { currentMode, TEST_MODE, PRODUCTION_MODE } = require("../api.js");

//config stripe
const functions = require("firebase-functions");
var stripe = require("stripe")(functions.config().stripe.token);
// var stripe = null;
// if (currentMode === TEST_MODE) {
//   // stripe = require("stripe")(process.env.TEST_STRIPE_PUBLIC_API_KEY);
//   // console.log(
//   //   TEST_MODE + "@@@@@@@@@@@@@@@@@@@@@##",
//   //   currentMode,
//   //   process.env.TEST_STRIPE_PUBLIC_API_KEY
//   // );
// } else if ((currentMode = PRODUCTION_MODE)) {
//   // stripe = require("stripe")(process.env.TEST_STRIPE_PUBLIC_API_KEY);
//   // console.log(
//   //   PRODUCTION_MODE + "@@@@@@@@@@@@@@@@@@@@@##",
//   //   currentMode,
//   //   process.env.TEST_STRIPE_PUBLIC_API_KEY
//   // );
// }

console.log(
  "444444444444@@@@@@@@@@@@@@@@@@@@@@@@@ dfafafsd a",
  // process.env.TEST_STRIPE_PUBLIC_API_KEY,
  typeof stripe
  // stripe
);

//customer_email:顧客のメールアドレス
exports.stripe_create_customer = async function (email) {
  const customer = await stripe.customers.create({ email: email });
  const customerId = customer.id;
  console.log("stripe_create_customer, customerId@@@@### ", customerId);
  return customerId;
};

//id:顧客のID
//num:カード番号, month:カードの有効期限, year:カードの有効期限, cvc:カードのセキュリティ番号
exports.stripe_create_card = async function (customerId, token) {
  const params = {
    source: token.id,
  };
  const card = await stripe.customers.createSource(customerId, params);
  console.log("card ", card);
  return card;
};

exports.stripe_delete_card = async function (customerId, cardId) {
  const card = await stripe.customers.deleteSource(customerId, cardId);
  return card;
};

//price:請求価格, description:説明, customer_id:顧客のID
exports.stripe_charge = async function (chargeParams) {
  var charge = null;
  charge = await stripe.charges.create({
    amount: chargeParams.price,
    currency: "usd",
    description: chargeParams.description,
    customer: chargeParams.customerId,
  });

  return charge;
};

exports.stripe_retrieve_cards = async function (customerId) {
  const cards = await stripe.customers.listSources(customerId, {
    object: "card",
    limit: 1,
  });
  // console.log("cards.length: ", cards.length);
  const card = cards.data[0];
  return card;

  // const card = await stripe.customers.deleteSource(customerId, cardId);
  // return card;
};

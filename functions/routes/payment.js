const express = require("express");
const router = express.Router();
const export_func = require("../helper/payment/stripe_exports");

router.post("/stripe_create_customer", async (req, res) => {
  const customerId = await export_func.stripe_create_customer(req.body.email);
  res.json({ customerId: customerId });
});

router.post("/stripe_create_card", async (req, res) => {
  const customerId = req.body.customerId;
  const token = req.body.token;
  const card = await export_func.stripe_create_card(customerId, token);

  res.json({ card: card });
});

router.post("/stripe_delete_card", async (req, res) => {
  const customerId = req.body.customerId;
  const cardId = req.body.cardId;
  const card = await export_func.stripe_delete_card(customerId, cardId);
  res.json({ card: card });
});

router.post("/stripe_charge", async (req, res) => {
  let price = Math.round(req.body.price * 100);
  const chargeParams = {
    price: price,
    description: "purchase one content",
    customerId: req.body.customerId
  };

  const charge = await export_func.stripe_charge(chargeParams);
  // res.send(`stripe charge id.\n ${charge}`);
  res.json(charge);
});

router.post("/stripe_retrieve_cards", async (req, res) => {
  const customerId = req.body.customerId;
  const card = await export_func.stripe_retrieve_cards(customerId);
  res.json({ card: card });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const export_func = require("../helper/contactus/contactus_exports");

router.post("/contactus", async (req, res) => {
  await export_func.contactus(
    req.body.email,
    req.body.username,
    req.body.description
  );
  console.log("contactusですよ。@@@@@@@@@@@@@@@@@@: ");
  res.json({ done: "done" });
});

module.exports = router;

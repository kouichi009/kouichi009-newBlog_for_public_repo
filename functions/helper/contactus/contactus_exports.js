const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");
const admin = require("firebase-admin");

// 環境変数に入れて管理する。functions.config()...
const SENDGRID_API_KEY = functions.config().SENDGRID_API_KEY;
// 環境変数に入れて管理する。functions.config()... また、gmailは迷惑メールに入るので、独自ドメインのメールアドレスを利用する。 sendgridの方でも、登録必要。
const adminEmail = "esperanza5655@gmail.com";

exports.contactus = async function (email, username, description) {
  sgMail.setApiKey(SENDGRID_API_KEY);

  const name = email.split("@")[0];

  const msgToUser = {
    to: email, // Change to your recipient
    from: adminEmail, // Change to your verified sender
    templateId: "d-df32e8b8c6e44d7489dcb8c8503fd6e7",
    dynamic_template_data: {
      name: name,
      email: email,
    },
  };

  const msgToAdmin = {
    to: adminEmail, // Change to your recipient
    from: adminEmail, // Change to your verified sender
    templateId: "d-afbbde9d68934299a585559ade3d2201",
    dynamic_template_data: {
      name: name,
      email: email,
      username: username,
      description: description,
    },
  };

  await Promise.all([sgMail.send(msgToUser), sgMail.send(msgToAdmin)]);

  await createContactUs(email, username, description);
  console.log("successMEssage@@@@@@@@@@@@@@@@@@@@@: ");
  return;
};

async function createContactUs(email, username, description) {
  const contactUsId = admin.firestore().collection("contactUs").doc().id;
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  const contactUsRef = admin
    .firestore()
    .collection("contactUs")
    .doc(contactUsId);

  await contactUsRef.set({
    id: contactUsId,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
    isReplied: false,
    email: email,
    username: username,
    description: description,
  });
}

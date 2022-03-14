const admin = require("firebase-admin");

const TEST_MODE = "testMode"; // テスト環境
const PRODUCTION_MODE = "productionMode"; // 本番環境

//テスト環境でデバックするときは、deployするのではなく、firebase serveでローカル環境にサーバーを建てるようにする。
let currentMode = TEST_MODE; // テスト環境か、本番環境かここで手動で変更する。

// module.exports = { currentMode, TEST_MODE, PRODUCTION_MODE };

exports.fetchPost = async function fetchPost(postId) {
  const docRef = admin
    .firestore()
    .collection("posts")
    .doc(postId);

  const snap = await docRef.get();
  const post = snap.data();
  return post;
};

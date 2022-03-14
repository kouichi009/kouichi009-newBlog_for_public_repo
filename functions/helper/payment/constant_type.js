let currentHostname = "aaa 1 3";
let location = "bbb 1 3";
if (process.browser) {
  currentHostname = window.location.hostname;
  console.log("000000 11 22 @@@@@@@@@@@: ");
  // location = window.location;
}

module.exports = { currentHostname, location };
// export { currentHostname, location };
// export const TEST_HOSTNAME = "localhost";
// export const PRODUCT_HOSTNAME = "blog-test01-ec54b.web.app";
// export const SOLD_DATE_AT = "soldDateAt";

// exports.TEST_HOSTNAME = "localhost";
// exports.currentHostname = "localhost";
// exports.location = "localhost";

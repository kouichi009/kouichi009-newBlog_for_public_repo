import moment from "moment";
import { db, firebase } from "~/plugins/firebase";

let currentHostname = "";
let location = null;
if (process.browser) {
  currentHostname = window.location.hostname;
  location = window.location;
}
export { currentHostname, location };
export const TEST_HOSTNAME = "localhost";
export const PRODUCT_HOSTNAME = "blog-test01-ec54b.web.app";
export const SOLD_DATE_AT = "soldDateAt";
export const CREATED_AT = "createdAt";
export const UPDATED_AT = "updatedAt";
export const DELETED_AT = "deletedAt";
export const DESC = "desc";
export const MAGICLINK = "magicLinkForSignIn";
export const UNAPPLIED = "unApplied";
export const APPLIED = "applied";
export const ERROR_APPLY_LIMIT_TIMES = "errorApplyLimitTimes";
export const ERROR_APPLY_UNDERMONEY = "errorApplyUnderMoney";
export const ERROR_APPLY_OVERMONEY = "errorApplyOverMoney";
export const ERROR_APPLY_NOBANK = "errorApplyNoBank";
export const COMMISSION_RATE = 12.5; // 12.5%
export const FIXED_FEE = 0.3; // $0.30(USD)
export const PROCESSING_RATE = 3; // 3%
export const PROCESSING_FIXED_FEE = 1; // $1(USD)
export const MIN_AMOUNT_TO_GET_PAID = 15; // $15(USD)
export const HELP_CENTER_MENUS = [
  {
    title: "Welcom to Publista",
    url: "/help/about"
  },
  {
    title: "introudce Publista",
    url: "/help/introduce"
  },
  {
    title: "How to make a paid article",
    url: "/help/create_paid_article"
  },
  { title: "How to get paid", url: "/help/how_get_paid" },
  { title: "Getting paid by Publista", url: "/help/getting_paid_info" },
  { title: "Contact us", url: "/help/contactus" }
];

export const ApiService = {
  getDate(timestamp) {
    const seconds = timestamp.seconds;
    let myDate = new Date(seconds * 1000);
    let composite = moment(myDate, "x").format("MMM D");
    return composite;
  },

  makeId(length) {
    var result = "";
    var characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
  compressImage(file, width, height) {
    return new Promise(async (resolve, reject) => {
      const payload = {
        quality: 0.8,
        maxWidth: width,
        maxHeight: height,
        mimeType: "image/*",
        async success(result) {
          resolve(result);
        },
        error(err) {
          resolve(null);
        }
      };
      new Compressor(file, payload);
    });
  },
  async uploadImageToStorage(file) {
    let uuid = this.makeId(32);

    var storageRef = firebase
      .storage()
      .ref()
      .child("tmp/" + uuid + file.name);

    let uploadTask = await storageRef.put(file);
    let url = await uploadTask.ref.getDownloadURL();
    return url;
  },
  async deleteCardFromStripe(privateInfo, axios) {
    let response = await axios.$post("/api/stripe_retrieve_cards", {
      customerId: privateInfo.stripeInfo.customerId
    });

    let response2 = await axios.$post("/api/stripe_delete_card", {
      customerId: privateInfo.stripeInfo.customerId,
      cardId: response.card.id
    });
    const deleteSuccessFlg = response2.card.deleted;
    console.log(
      "deletesuccessflg ",
      deleteSuccessFlg,
      privateInfo,
      privateInfo.stripeInfo
    );
    return;
    // if (deleteSuccessFlg) {
    //   return;
    // }
  },
  convertToHTML(str) {
    let blockHTML = $.parseHTML(str)[0];

    return blockHTML;
  },
  isEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
};

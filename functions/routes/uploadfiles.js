const express = require("express");
const cors = require("cors")({ origin: true });
const router = express.Router();
// const upload = require("../helper/upload/multer");
const axios = require("axios");
const cheerio = require("cheerio");
const export_func = require("../helper/upload/upload_exports");
const ogs = require("open-graph-scraper");

const getMetaData = html => {
  const results = {};
  const $ = cheerio.load(html);
  // タイトル取得
  $("head title").each((i, el) => {
    const $el = $(el);
    const content = $el.text();
    if (content) {
      results["title"] = content;
    }
  });
  // メタ取得
  $("head meta").each((i, el) => {
    const $el = $(el);
    const propertyName = $el.attr("property") || $el.attr("name");
    const content = $el.attr("content");
    if (propertyName && content) {
      results[propertyName] = content;
    }
  });
  // favicon取得
  $("head link").each((i, el) => {
    const $el = $(el);
    const propertyName = $el.attr("rel");
    const content = $el.attr("href");
    if (propertyName && content) {
      if (
        propertyName === "icon" ||
        propertyName === "shortcut icon" ||
        propertyName === "icon shortcut"
      ) {
        results["icon"] = content;
      }
    }
  });
  return results;
};

router.post("/uploadfiles", async (req, res) => {
  console.log("99 5012**** 0000000000000001: ", req.body.url);
  cors(req, res, async () => {
    try {
      const options = {
        url: req.body.url
        // onlyGetOpenGraphInfo: true,
        // customMetaTags: [
        //   {
        //     multiple: false, // is there more then one of these tags on a page (normally this is false)
        //     property: "hostname", // meta tag name/property attribute
        //     fieldName: "hostnameMetaTag" // name of the result variable
        //   }
        // ]
      };

      console.log(
        "options.onlyGetOpenGraphInfo@@@@@@@@@@@@: ",
        options.onlyGetOpenGraphInfo
      );
      console.log("opttions@@@@@@@@@@@@: ", options);

      // ogs(options).then(data => {
      //   const { error, result, response } = data;
      //   console.log("hostnameMetaTag:", result.hostnameMetaTag); // hostnameMetaTag: github.com
      //   res.json(result);
      // });
      ogs(options, (error, results, response) => {
        console.log("error:", error); // This is returns true or false. True if there was a error. The error it self is inside the results object.
        console.log("hostnameMetaTag:", results.hostnameMetaTag); // This contains all of the Open Graph results
        console.log("response:", typeof response); // This contains the HTML of page
        res.json(results);
      });

      return;
      // const response = await axios(req.query["url"]);
      console.log("6565 55cors@@@@@@@@@ 987333333 @@@@@@@: ", req.body.url);
      const response = await axios(req.body.url);
      // console.log(
      //   "response@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ ",
      //   response.data
      // );
      const results = getMetaData(response.data);
      console.log("results@@@@@@@@@@@@@@@@@@@@@@@@: ", results);
      res.json(results);
      // const response = await express.get(req.body.url);
      // const results = getMetaData(response.data);
      // res.json(results);
    } catch (err) {
      console.error("error01@@@@@@@@@@@@@@@@@@@@@@@@@@@ ", err.message);
    }
  });

  return;
  // console.log("google res@@@ 0 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@: ");
  // const app = express();
  // app.use(cors());
  // app.get("https://www.google.com/", function(req, res) {
  //   console.log("google req@@@ 2: ");
  //   console.log("google res@@@ 2 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@: ");

  //   res.json({
  //     req: req,
  //     res: res
  //   });
  // });

  // return;
  const urlStr = await export_func.uploadfiles(req, res);
  console.log("urlStr@@@@@@@@@@@@: ", urlStr);
  res.json(urlStr);
  // res.send(urlStr);
  // res.json({
  //   uploadUrl: urlStr
  // });
  // res.json({
  //   success: 1,
  //   file: {
  //     url: urlStr
  //   }
  // });
});

module.exports = router;

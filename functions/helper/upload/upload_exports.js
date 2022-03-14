const functions = require("firebase-functions");
const admin = require("firebase-admin");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");
const os = require("os");
const fs = require("fs");
const Busboy = require("busboy");
const express = require("express");
const cors = require("cors")({ origin: true });
const cheerio = require("cheerio");
const { uuid } = require("uuidv4");

// const getMetaData = html => {
//   const results = {};
//   const $ = cheerio.load(html);
//   // タイトル取得
//   $("head title").each((i, el) => {
//     const $el = $(el);
//     const content = $el.text();
//     if (content) {
//       results["title"] = content;
//     }
//   });
//   // メタ取得
//   $("head meta").each((i, el) => {
//     const $el = $(el);
//     const propertyName = $el.attr("property") || $el.attr("name");
//     const content = $el.attr("content");
//     if (propertyName && content) {
//       results[propertyName] = content;
//     }
//   });
//   // favicon取得
//   $("head link").each((i, el) => {
//     const $el = $(el);
//     const propertyName = $el.attr("rel");
//     const content = $el.attr("href");
//     if (propertyName && content) {
//       if (
//         propertyName === "icon" ||
//         propertyName === "shortcut icon" ||
//         propertyName === "icon shortcut"
//       ) {
//         results["icon"] = content;
//       }
//     }
//   });
//   return results;
// };

exports.uploadfiles = function(req, res) {
  // res.json("koJson");
  return;
  const data = {
    files: [
      {
        url:
          "https://firebasestorage.googleapis.com/v0/b/babel-77d1f.appspot.com/o/bg_contacto.jpg?alt=media&token=6c661655-d18c-45a1-a30a-ae94d2b37c52"
      }
    ]
  };

  console.log("data file98@@@@@@@@@@@@@: ", data, typeof data);

  res.json(data);
  return;

  return new Promise((resolve, reject) => {
    const busboy = new Busboy({
      headers: req.headers
    });
    // // This object will accumulate all the uploaded files, keyed by their name.
    const uploads = {};
    const allowMimeTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif"
    ];

    // file upload bucket

    const bucket = admin
      .storage()
      .bucket(
        /*functions.config().fileupload.bucket.name*/ "gs://blog-test01-ec54b.appspot.com"
      );

    // // const bucket = storage.bucket(functions.config().fileupload.bucket.name);
    // This callback will be invoked for each file uploaded.
    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      if (!allowMimeTypes.includes(mimetype.toLocaleLowerCase())) {
        console.warn("disallow mimetype: " + mimetype);
        return;
      }
      // Note that os.tmpdir() is an in-memory file system, so should
      // only be used for files small enough to fit in memory.
      const tmpdir = os.tmpdir();
      const filepath = path.join(tmpdir, filename);
      file.pipe(fs.createWriteStream(filepath));

      file.on("end", () => {
        uploads[fieldname] = {
          filepath,
          mimetype
        };

        const uuidStr = uuid();

        const metadata = {
          contentType: mimetype,
          firebaseStorageDownloadTokens: uuidStr
        };

        const destination = `upload_images/${uuidStr}${
          path.parse(filepath).ext
        }`;
        bucket
          .upload(filepath, {
            destination: destination,
            metadata: {
              metadata: metadata
            }
          })
          .then(data => {
            let file = data[0];

            let urlStr =
              "https://firebasestorage.googleapis.com/v0/b/" +
              bucket.name +
              "/o/" +
              encodeURIComponent(file.name) +
              "?alt=media&token=" +
              uuidStr;

            resolve(urlStr);
            // res.json({
            //   success: 1,
            //   file: {
            //     url: urlStr
            //   }
            // });
          })
          .catch(err => {
            console.error("エラーだよ10/24: ", err);
            // TODO error handling
          });
      });
    });

    // This callback will be invoked after all uploaded files are saved.
    busboy.on("finish", () => {
      if (Object.keys(uploads).length === 0) {
        res.status(200).send("success: 0 file upload");
        return;
      }
      // res.json({
      //   success: 1,
      //   file: {
      //     url:
      //       "https://www.tesla.com/tesla_theme/assets/img/_vehicle_redesign/roadster_and_semi/roadster/hero.jpg"
      //     // ... and any additional fields you want to store, such as width, height, color, extension, etc
      //   }
      // });
      //   res.status(200).send(JSON.stringify(uploads));
    });

    // The raw bytes of the upload will be in req.rawBody. Send it to
    // busboy, and get a callback when it's finished.
    busboy.end(req.rawBody);
  });
};

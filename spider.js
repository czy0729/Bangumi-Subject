/*
 * @Author: czy0729
 * @Date: 2020-01-14 18:51:27
 * @Last Modified by: czy0729
 * @Last Modified time: 2020-01-14 21:06:27
 */
const axios = require("axios");
const cheerio = require("./utils/cheerio");
const fs = require("fs");
const path = require("path");

const HOST = "https://bangumi.tv";

const START_ID = 200014;
const END_ID = 298350; // 2020/01/14

(async () => {
  for (let id = START_ID; id <= END_ID; id++) {
    const { data } = await axios({
      url: `${HOST}/subject/${id}`,
      headers: {
        Cookie:
          "chii_cookietime=2592000; chii_sid=8QpPqe; chii_auth=DKKylRLwViX7z7mM%2BNDojP%2BC3YrhQRbZ7mb3c2bc4%2B8UERL86NKtwDnro%2BPglSIgLSGPKOp%2BpnQp6n6n1S3f9NiMRDVwuw5wHwxA",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36"
      }
    });
    const subject = cheerio.cheerioSubjectFormHTML(data);

    const filePath = `./data/${Math.floor(id / 100)}/${id}.json`;
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
    console.log(`- writing ${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(subject));
  }
})();

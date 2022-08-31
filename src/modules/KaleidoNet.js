import axios from "axios";
import { kaleidoNet } from "@/config/index";
import { string } from "prop-types";
import fs from "fs";
class KaleidoNet {
  constructor() {
    (this.kaleidoNet = kaleidoNet),
      (this.apiInstance = axios.create({
        baseURL: kaleidoNet.endpoint,
        headers: {
          Authorization: `Basic ${kaleidoNet.apiSercet}`,
        },
      }));
  }

  downloadZipFile = async (cid) => {
    console.log(this.kaleidoNet);
    const url =
      this.kaleidoNet.endpoint +
      this.kaleidoNet.downloadURI.replace(/{cid}/i, cid);
    const baseDir = process.cwd();
    const writer = fs.createWriteStream(`${baseDir}/${cid}` + ".zip");

    const response = await this.apiInstance.post(
      url,
      {},
      {
        responseType: "stream",
        headers: {
          Authorization: `Basic ${this.kaleidoNet.apiSercet}`,
        },
      }
    );

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        resolve(`${baseDir}/${cid}` + ".zip");
      });
      writer.on("error", reject);
    });

    // return await this.apiInstance
    //   .post(
    //     url,
    //     {},
    //     {
    //       responseType: "stream",
    //       headers: {
    //         Authorization: `Basic ${this.kaleidoNet.apiSercet}`,
    //       },
    //     }
    //   )
    //   .then((res) => {
    //     if (res.status == 200) {
    //       const baseDir = process.cwd();
    //       res.data.pipe(fs.createWriteStream(`${baseDir}/${cid}` + ".zip"));
    //       res.data.on("end", () => {
    //         console.log("download completed");
    //         return `${baseDir}/${cid}` + ".zip";
    //       });
    //     } else {
    //       console.log(`ERROR >> ${res.status}`);
    //       return false;
    //     }
    //   })
    //   .catch((err) => {
    //     console.log("Error ", err);
    //   });
  };
}

module.exports = KaleidoNet;

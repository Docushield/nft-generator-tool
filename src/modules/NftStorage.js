import config from "@/config/index";
import _ from "lodash";
import { NFTStorage, File } from "nft.storage";
import mime from "mime";
import path from "path";
import fs from "fs";

class NftStorage {
  constructor() {
    this.apikey = config.nftStorage.apikey;
  }

  static getInstance() {
    if (!NftStorage.instance) {
      NftStorage.instance = new NftStorage();
    }
    return NftStorage.instance;
  }

  storeNFT = async (imagePath) => {
    // load the file from disk
    const image = await this.fileFromPath(imagePath);

    // create a new NFTStorage client using our API key
    const nftstorage = new NFTStorage({ token: this.apikey });

    const cid = await nftstorage.storeBlob(image);
    // console.log("imagePath:", imagePath, ",image:", image, ",cid:",cid);
    return cid;
  };

  async fileFromPath(filePath) {
    const content = await fs.promises.readFile(filePath);
    const type = mime.getType(filePath);
    return new File([content], path.basename(filePath), { type });
  }
}

module.exports = NftStorage.getInstance();

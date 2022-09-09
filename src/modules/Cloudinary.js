import config from "@/config/index";
import _ from "lodash";
const cloudinary = require("cloudinary").v2;
class Cloudinary {
  constructor() {
    cloudinary.config({
      secure: true,
      cloud_name: config.cloudinary.cloud_name,
      api_key: config.cloudinary.api_key,
      api_secret: config.cloudinary.api_secret,
    });
    this.cloudinaryInstance = cloudinary;
  }

  static getInstance() {
    if (!Cloudinary.instance) {
      Cloudinary.instance = new Cloudinary();
    }
    return Cloudinary.instance;
  }

  async upload(filename) {
    const response = await this.cloudinaryInstance.uploader.upload(filename, {
      folder: "mint-gen",
    });
    return response;
  }
}

module.exports = Cloudinary.getInstance();

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import _ from "lodash";

import Cloudinary from '@/modules/Cloudinary';
import axios from "axios";

async function handle(req, res) {
  const { method, body } = req;
  switch (method) {
    case "POST":
      await handlePost(body, res);
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}

async function handlePost(data, res) {
  // const { sourceZip, organizeData, collection} = data;
  const cbackserver = process.env.GENERATORSERVER
  const url = await axios.post(`${cbackserver}/preview`, data).then((response) => {
    if (response.status == 200) {
      const { preview } = response.data;
      const url = `${preview}`;
      console.log("url:", url);
      return url;
    }
  });
  const previewurl = await _uploadPreviewImage(url);
  res.status(200).json({ preview: previewurl});
}

async function _uploadPreviewImage(path) {
  const response = await Cloudinary.upload(path);
  // console.log(response);
  return response.secure_url;
}


export default handle;

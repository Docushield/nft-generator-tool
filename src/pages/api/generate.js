// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import JSZip from "jszip";
import fs from "fs";
import _ from "lodash";
import fse from "fs-extra";
import { _fetchFilePath } from "@/utils/helper";
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
  const footprint = await axios.post(`${cbackserver}/generate`, data).then((response) => {
    if (response.status == 200) {
      const { footprint } = response.data;
      console.log("footprint:", footprint);
      return footprint;
    }
  });
  const zipfile = await _zipOutputfile(footprint);
  res.status(200).json(zipfile);
}

async function _zipOutputfile(footprint) {
  const storageDir = process.env.STORAGE;
  const jsonDir = `${storageDir}/${footprint}/build/json`;

  const paths = _fetchFilePath(jsonDir);
  // console.log("paths:", paths);
  return new Promise((resolve, reject) => {
    const JSzipHdl = new JSZip();
    paths.forEach(file => {
      const relativeFile = _.split(file,footprint)[1];
      // console.log("relativeFile:", relativeFile);
      if (relativeFile) {
        const content = fs.readFileSync(file)
        JSzipHdl.file(relativeFile, content);
      }
    })
    JSzipHdl.generateNodeStream({ type: "nodebuffer", streamFiles: true })
      .pipe(fs.createWriteStream("package.zip"))
      .on("finish", function () {
        // JSZip generates a readable stream with a "end" event,
        // but is piped here in a writable stream which emits a "finish" event.
        console.log("package.zip written.");
        const basedir = process.cwd();
        const storageDir = process.env.STORAGE;
        fse.moveSync(`${basedir}/package.zip`, `${storageDir}/${footprint}/package.zip`, {overwrite:true})
        resolve({footprint, downzip:'package.zip'});
      });
  });
}



export default handle;

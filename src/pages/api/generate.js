// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import JSZip from "jszip";
import fs from "fs";
import _ from "lodash";
import fse from "fs-extra";
import { _fetchFilePath } from "@/utils/helper";
import axios from "axios";
import { basename } from "path";
import ipfsOnlyHash from "ipfs-only-hash";
import crypto from "crypto"
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
  
  await _buildOutputfile(footprint);
  const zipfile = await _zipOutputfile(footprint);
  res.status(200).json(zipfile);
}

async function _buildOutputfile(footprint) {
  const storageDir = process.env.STORAGE;
  const jsonDir = `${storageDir}/${footprint}/build/json`;
  const originalFile = `${jsonDir}/nft-collection-original.json`;
  let rawdata = fs.readFileSync(originalFile);
  let jsonData = JSON.parse(rawdata);
  // console.log(jsonData);
  let tokenList = jsonData['token-list'];
  for (let it = 0; it < tokenList.length; it++) {
    let token = tokenList[it];
    const cid = await ipfsOnlyHash.of(fs.readFileSync(token.hash));
    // console.log("cid:",cid);
    token.content_uri = {
      scheme:`ipfs://${cid}`,
      data:cid
    }
    const sha256hash = crypto.createHash("sha256").update(fs.readFileSync(token.hash)).digest("hex")
    const base64hash = Buffer.from(sha256hash).toString('base64')
    token.hash = base64hash
  }
  console.log("tokenList:",tokenList);
  jsonData["token-list"] = tokenList;

  fs.writeFileSync(`${jsonDir}/nft-collection.json`, JSON.stringify(jsonData, null, 2));
}

async function _zipOutputfile(footprint) {
  const storageDir = process.env.STORAGE;
  const jsonDir = `${storageDir}/${footprint}/build/json`;

  const paths = _fetchFilePath(jsonDir);
  // console.log("paths:", paths);
  return new Promise((resolve, reject) => {
    const JSzipHdl = new JSZip();
    paths.forEach(file => {
      if (basename(file) == "nft-collection-original.json") return;
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

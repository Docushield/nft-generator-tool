// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import JSZip from "jszip";
import fs from "fs";
import _ from "lodash";
import fse from "fs-extra";
import { _fetchFilePath } from "@/utils/helper";
import axios from "axios";
import { basename } from "path";
import ipfsOnlyHash from "ipfs-only-hash";
import crypto from "crypto";
import blake2b from "blake2b";
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
  const cbackserver = process.env.GENERATORSERVER;
  const footprint = await axios
    .post(`${cbackserver}/generate`, data)
    .then((response) => {
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
  let tokenList = jsonData["token-list"];
  let tokenHashs = [];
  for (let it = 0; it < tokenList.length; it++) {
    let token = tokenList[it];
    const cid = await ipfsOnlyHash.of(fs.readFileSync(token.hash),{cidVersion:1});
    // console.log("cid:",cid);
    token.content_uri = {
      scheme: "ipfs://",
      data: cid,
    };
    // const sha256hash = crypto.createHash("sha256").update(fs.readFileSync(token.hash)).digest("hex")
    // tokenHashs.push(sha256hash);
    // const base64hash = Buffer.from(sha256hash).toString('base64')

    let output = new Uint8Array(32); // 256 bit
    const blake2bHash = blake2b(output.length)
      .update(fs.readFileSync(token.hash))
      .digest("hex");
    const base64hash = Buffer.from(blake2bHash).toString("base64");
    token.hash = base64hash;

    tokenHashs.push(base64hash);
  }
  // console.log("tokenList:",tokenList);
  jsonData["reveal-at"] = jsonData["mint-starts"];
  jsonData["token-list"] = tokenList;

  let output = new Uint8Array(32) // 256 bit
  let input = Buffer.from(JSON.stringify(tokenHashs.sort()));
  const provenanceHash = blake2b(output.length).update(input).digest('hex');
  jsonData["provenance-hash"] = Buffer.from(provenanceHash).toString("base64");

  jsonData["mint-royalties"] = {
    rates: [
      {
        description: "creator",
        stakeholder:
          "k:047bc663e6cdaccb268e224765645dd11573091f9ff2ac083508b46a0647ace0",
        rate: 0.975,
      },
      {
        description: "mintit",
        stakeholder:
          "k:d46967fd03942c50f0d50edc9c35d018fe01166853dc79f62e2fdf72689e0484",
        rate: 0.025,
      },
    ],
  };

  jsonData["sale-royalties"] = {
    rates: [
      {
        description: "creator",
        stakeholder:
          "k:047bc663e6cdaccb268e224765645dd11573091f9ff2ac083508b46a0647ace0",
        rate: 0.025,
      },
      {
        description: "mintit",
        stakeholder:
          "k:d46967fd03942c50f0d50edc9c35d018fe01166853dc79f62e2fdf72689e0484",
        rate: 0.025,
      },
    ],
  };

  fs.writeFileSync(
    `${jsonDir}/nft-collection.json`,
    JSON.stringify(jsonData, null, 2)
  );
}

async function _zipOutputfile(footprint) {
  const storageDir = process.env.STORAGE;
  const jsonDir = `${storageDir}/${footprint}/build/json`;

  const paths = _fetchFilePath(jsonDir);
  // console.log("paths:", paths);
  return new Promise((resolve, reject) => {
    const JSzipHdl = new JSZip();
    paths.forEach((file) => {
      if (basename(file) == "nft-collection-original.json") return;
      const relativeFile = _.split(file, footprint)[1];
      // console.log("relativeFile:", relativeFile);
      if (relativeFile) {
        const content = fs.readFileSync(file);
        JSzipHdl.file(relativeFile, content);
      }
    });
    JSzipHdl.generateNodeStream({ type: "nodebuffer", streamFiles: true })
      .pipe(fs.createWriteStream("package.zip"))
      .on("finish", function () {
        // JSZip generates a readable stream with a "end" event,
        // but is piped here in a writable stream which emits a "finish" event.
        console.log("package.zip written.");
        const basedir = process.cwd();
        const storageDir = process.env.STORAGE;
        fse.moveSync(
          `${basedir}/package.zip`,
          `${storageDir}/${footprint}/package.zip`,
          { overwrite: true }
        );
        resolve({ footprint, downzip: "package.zip" });
      });
  });
}

export default handle;

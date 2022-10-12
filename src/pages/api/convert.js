// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import JSZip from "jszip";
import fs from "fs";
import _ from "lodash";
import fse from "fs-extra";
import { _fetchFilePath, copyObjectWithSortedKeys } from "@/utils/helper";
import axios from "axios";
import { basename } from "path";
import crypto from "crypto";
import blake2b from "blake2b";
import NftStorage from "@/modules/NftStorage";
import CIDv1 from "@/modules/CIDv1"
import base64url from "base64url";
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
  const { sourceZip, collection } = data;
  const { footprint } = await _unzipPackage(sourceZip);
  console.log(sourceZip, collection);
  const { tokens, tokenHashs } = await _buildTokenMeta(footprint);
  console.log("tokens:", tokens);
  const collectionMetadata = await _buildCollectionMeta(
    footprint,
    collection,
    tokens,
    tokenHashs
  );

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

async function _buildTokenMeta(footprint) {
  const storageDir = process.env.STORAGE;
  const imagesDir = `${storageDir}/${footprint}`;

  const images = _getElements(imagesDir);
  let tokens = [];
  let tokenHashs = [];
  for (let it = 0; it < images.length; it++) {
    const image = images[it];
    // const cid = await NftStorage.storeNFT(image.path);
    const cid = await CIDv1.calcCIDv1(image.path);
    // const cid = await ipfsOnlyHash.of(fs.readFileSync(image.path), {
    //   cidVersion: 1,
    // });
    // console.log("cid:",cid);
    const token = {
      hash: "",
      spec: {
        type: "normal",
        value: {
          attributes: [
            {
              trait_type: "Name",
              value: image.filename.slice(0, -4),
            },
          ],
        },
      },
      content_uri: {
        scheme: "ipfs://",
        data: "",
      },
    };
    token.content_uri = {
      scheme: "ipfs://",
      data: cid,
    };

    let output = new Uint8Array(32); // 256 bit
    // const blake2bHash = blake2b(output.length)
    //   .update(fs.readFileSync(image.path))
    //   .digest("binary");
    const specBuffer = Buffer.from(
      JSON.stringify(copyObjectWithSortedKeys(token.spec))
    );
    const blake2bHash = blake2b(output.length)
      .update(specBuffer)
      .digest("binary");
    const base64hash = Buffer.from(blake2bHash).toString("base64");
    const base64hashurl = base64url.fromBase64(base64hash);
    token.hash = base64hashurl;
    tokens.push(token);
    tokenHashs.push(base64hashurl);
  }

  return { tokens, tokenHashs };
}

async function _buildCollectionMeta(
  footprint,
  collection,
  tokenMetas,
  tokenHashs
) {
  let output = new Uint8Array(32); // 256 bit
  let input = Buffer.from(tokenHashs.join(""));
  const provenanceHash = blake2b(output.length).update(input).digest("binary");
  const provenanceHashBase64 = Buffer.from(provenanceHash).toString("base64");
  const provenanceHashBase64url = base64url.fromBase64(provenanceHashBase64);

  const collectiondata = {
    creator: collection.creator,
    description: collection.description,
    name: collection.collectionName,
    "provenance-hash": provenanceHashBase64url,
    "mint-starts": collection.mintStart,
    "reveal-at": collection.mintStart,
    "premint-ends": collection.premintEnd,
    size: tokenMetas.length,
    "token-list": tokenMetas,
    "mint-price": parseFloat(collection.mintPrice),
    "premint-price": parseFloat(collection.mintPrice),
    "mint-royalties": {
      rates: [
        {
          description: "creator",
          stakeholder:
            "k:047bc663e6cdaccb268e224765645dd11573091f9ff2ac083508b46a0647ace0",
          "stakeholder-guard": {
            keys: [
              "047bc663e6cdaccb268e224765645dd11573091f9ff2ac083508b46a0647ace0",
            ],
            pred: "keys-all",
          },
          rate: 0.975,
        },
        {
          description: "mintit",
          stakeholder:
            "k:d46967fd03942c50f0d50edc9c35d018fe01166853dc79f62e2fdf72689e0484",
          "stakeholder-guard": {
            keys: [
              "d46967fd03942c50f0d50edc9c35d018fe01166853dc79f62e2fdf72689e0484",
            ],
            pred: "keys-all",
          },
          rate: 0.025,
        },
      ],
    },
    "sale-royalties": {
      rates: [
        {
          description: "creator",
          stakeholder:
            "k:047bc663e6cdaccb268e224765645dd11573091f9ff2ac083508b46a0647ace0",
          "stakeholder-guard": {
            keys: [
              "047bc663e6cdaccb268e224765645dd11573091f9ff2ac083508b46a0647ace0",
            ],
            pred: "keys-all",
          },
          rate: 0.025,
        },
        {
          description: "mintit",
          stakeholder:
            "k:d46967fd03942c50f0d50edc9c35d018fe01166853dc79f62e2fdf72689e0484",
          "stakeholder-guard": {
            keys: [
              "d46967fd03942c50f0d50edc9c35d018fe01166853dc79f62e2fdf72689e0484",
            ],
            pred: "keys-all",
          },
          rate: 0.025,
        },
      ],
    },
    "premint-whitelist": collection.whiteList,
    type: collection.mintType,
  };

  const storageDir = process.env.STORAGE;
  const jsonDir = `${storageDir}/${footprint}/build/json`;
  fse.ensureDirSync(jsonDir);
  fs.writeFileSync(
    `${jsonDir}/nft-collection.json`,
    JSON.stringify(collectiondata, null, 2)
  );

  return collectiondata;
}

function _getElements(path) {
  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((i, index) => {
      return {
        id: index,
        filename: i,
        path: `${path}/${i}`,
      };
    });
}

async function _unzipPackage(filename) {
  const rootdir = process.cwd();
  const storageDir = process.env.STORAGE;
  const zipfile = `${storageDir}/upload/${filename}`;
  const content = fs.readFileSync(zipfile);
  const JSzipHdl = new JSZip();
  const result = await JSzipHdl.loadAsync(content);
  const keys = Object.keys(result.files);

  const footprint = basename(zipfile).replace(/\.[^/.]+$/, "");
  console.log("footprint:", footprint);
  fse.ensureDirSync(`${storageDir}/${footprint}/`);
  for (let key of keys) {
    const item = result.files[key];
    if (item.dir) {
      console.log(item.name);
      fse.ensureDirSync(`${storageDir}/${footprint}/` + item.name);
    } else {
      console.log("name:", basename(item.name));
      fs.writeFileSync(
        `${storageDir}/${footprint}/` + item.name,
        Buffer.from(await item.async("arraybuffer"))
      );
    }
  }

  return { footprint };
}

export default handle;

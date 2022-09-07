// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import HashLipEngine from "@/engine/index";
import HashLipPreview from "@/engine/preview";
import { _fetchFilePath } from "@/utils/helper";
import JSZip from "jszip";
import fs from "fs";
import path from "path";
import _ from "lodash";
import crypto from "crypto";
import fse from "fs-extra";
import Cloudinary from '@/modules/Cloudinary';

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
  const { sourceZip, organizeData, collection, currentprint } = data;
  if ( currentprint == "") {
    const { footprint, localtion } = await _unzipAssets(
      sourceZip
    );
    const { layersOrder, layersDir } = _createLayers(
      footprint,
      localtion,
      organizeData
    );
    const layerConfig = {
      growEditionSizeTo: parseInt(collection.total),
      layersOrder: layersOrder,
    };
    // const outputPath = await _generate(layerConfig, collection, layersDir, footprint);
    console.log("total:", layerConfig.growEditionSizeTo);
    const outputPath = _generateAsync(layerConfig, collection, layersDir, footprint);
    const previewGif = await _generatePreviewGif(footprint);
    res.status(200).json({ preview: previewGif, footprint:footprint });
  }
  else {
    const previewGif = await _generatePreviewGif(currentprint);
    res.status(200).json({ preview: previewGif, footprint:currentprint });
  }
}

async function _unzipAssets(filename) {
  const rootdir = process.cwd();
  const zipfile = `${rootdir}/space/upload/${filename}`;
  const content = fs.readFileSync(zipfile);
  const JSzipHdl = new JSZip();
  const result = await JSzipHdl.loadAsync(content);
  const keys = Object.keys(result.files);

  const footprint = path.basename(zipfile).replace(/\.[^/.]+$/, "");

  let localtion = "";
  for (let key of keys) {
    const item = result.files[key];
    if (item.dir) {
      if (_.isEmpty(localtion)) {
        localtion = _.split(item.name, "/", 2)[0];
      }
      fse.ensureDirSync(`${rootdir}/space/${footprint}/` + item.name);
    } else {
      fs.writeFileSync(
        `${rootdir}/space/${footprint}/` + item.name,
        Buffer.from(await item.async("arraybuffer"))
      );
    }
  }

  return { footprint, localtion };
}

function _createLayers(footprint, localtion, organizeData) {
  const baseDir = `${process.cwd()}/space/${footprint}`;
  const paths = _fetchFilePath(`${baseDir}/${localtion}`);
  // console.log(paths,organizeData);
  const collection = new Map();
  paths.forEach((absolutePath) => {
    const relativePath = _.trimStart(_.split(absolutePath, footprint)[1], "/");
    const hash = crypto.createHash("sha256").update(relativePath).digest("hex");
    collection.set(hash, absolutePath);
    // console.log(
    //   "relativePath:",
    //   relativePath,
    //   "hash:",
    //   hash,
    //   "item:",
    //   absolutePath
    // );
  });

  let layersOrder = [];

  organizeData.forEach((item) => {
    layersOrder.push({ name: item.name });
    item.elements.forEach((el) => {
      const absolutePath = collection.get(el.hash);
      // console.log("el.hash:", el.hash, ",path:", absolutePath);
      el.sPath = absolutePath;

      const prefix = _.split(absolutePath, footprint)[0] + "/" + footprint;
      if (0 > el.element.indexOf("#")) {
        const arr = _.split(el.element, ".");
        const filename = arr[0] + "#" + el.rarity + "." + arr[1];
        el.dPath = prefix + "/destLayers/" + item.name + "/" + filename;
      } else {
        el.dPath = prefix + "/destLayers/" + item.name + "/" + el.element;
      }
      const localtionPath = el.dPath.substring(0, el.dPath.lastIndexOf("/"));
      // console.log(
      //   "sPath:",
      //   el.sPath,
      //   "dPath:",
      //   el.dPath,
      //   ",localtionPath:",
      //   localtionPath
      // );
      fse.ensureDirSync(`${localtionPath}`);
      fse.copyFileSync(`${el.sPath}`, `${el.dPath}`);
    });
  });

  return { layersOrder, layersDir: `${baseDir}/destLayers` };
}

async function _generate(layersConfig, collection, layersDir, footprint) {
  const engine = new HashLipEngine(
    layersConfig,
    collection,
    layersDir,
    footprint
  );
  engine.buildSetup();
  await engine.startCreating(layersConfig, collection, layersDir);
  return engine.getBuildDir();
}


async function _generateAsync(layersConfig, collection, layersDir, footprint) {
  const engine = new HashLipEngine(
    layersConfig,
    collection,
    layersDir,
    footprint
  );
  engine.buildSetup();
  engine.startCreatingAsync(layersConfig, collection, layersDir);
  return engine.getBuildDir();
}


async function _generatePreview(footprint) {
  // const paths = _fetchFilePath(outputBuild);
  const hashLipPreview = new HashLipPreview(
    footprint
  );
  
  const previewImage = await hashLipPreview.preview()
  const response = await Cloudinary.upload(previewImage);
  // console.log(response);
  return response.secure_url;
}

async function _generatePreviewGif(footprint) {
  const hashLipPreview = new HashLipPreview(
    footprint
  );
  const gif = await hashLipPreview.previewGif();
  // const imageName = path.basename(gif);
  // const baseDir = process.cwd();
  // const publicDir = `${baseDir}/public`;
  
  // fse.copyFileSync(gif,`${publicDir}/${footprint}_${imageName}`);
  // console.log(gif, `${publicDir}/${footprint}_${imageName}`)
  // return `${footprint}_${imageName}`;

  if (!gif) {
    return "not yet";
  }

  const response = await Cloudinary.upload(gif);
  // console.log(response);
  return response.secure_url;
}


export default handle;

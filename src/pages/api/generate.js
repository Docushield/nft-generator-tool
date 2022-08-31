// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import HashLipEngine from "@/engine/index";
// import KaleidoNet from "@/modules/KaleidoNet";
import JSZip from "jszip";
import fs from "fs";
import path from "path";
import _, { lastIndexOf } from "lodash";
import crypto from "crypto";
import fse from "fs-extra";
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
  // engine.buildSetup();
  // engine.startCreating();
  // const kaleidoNetInstance = new KaleidoNet();
  // const file = await kaleidoNetInstance.downloadZipFile(process.env.NEXT_CID)
  console.log(data);
  const { sourceZip, organizeData, collection } = data;
  const { footprint, localtion } = await _unzipAssets(
    sourceZip
  );
  const { layersOrder, layersDir } = _createLayers(
    footprint,
    localtion,
    organizeData
  );
  console.log("layersOrder:", layersOrder);
  const layerConfig = {
    growEditionSizeTo: collection.total,
    layersOrder: layersOrder,
  };
  console.log("layerConfig:", layerConfig);
  const outputPath = await _generate(layerConfig, collection, layersDir, footprint);
  const zipfile = await _zipOutputfile(footprint, outputPath);
  console.log(footprint, localtion, outputPath, zipfile, outputPath);
  res.status(200).json({ download: zipfile });
}

async function _unzipAssets(filename) {
  const rootdir = process.cwd();
  const zipfile = `${rootdir}/space/upload/${filename}`;
  const content = fs.readFileSync(zipfile);
  const JSzipHdl = new JSZip();
  const result = await JSzipHdl.loadAsync(content);
  const keys = Object.keys(result.files);

  const footprint = path.basename(zipfile).replace(/\.[^/.]+$/, "");
  fse.ensureDirSync(`${rootdir}/${footprint}`);

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
    console.log(
      "relativePath:",
      relativePath,
      "hash:",
      hash,
      "item:",
      absolutePath
    );
  });

  let layersOrder = [];

  organizeData.forEach((item) => {
    layersOrder.push({ name: item.name });
    item.elements.forEach((el) => {
      console.log("el.hash:", el.hash);
      const absolutePath = collection.get(el.hash);
      console.log("el.hash:", el.hash, ",path:", absolutePath);
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
      console.log(
        "sPath:",
        el.sPath,
        "dPath:",
        el.dPath,
        ",localtionPath:",
        localtionPath
      );
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

async function _zipOutputfile(footprint, outputBuild) {
  const paths = _fetchFilePath(outputBuild);
  console.log("paths:", paths);
  return new Promise((resolve, reject) => {
    const JSzipHdl = new JSZip();
    paths.forEach(file => {
      const relativeFile = _.split(file,footprint)[1];
      console.log("relativeFile:", relativeFile);
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
        fse.moveSync(`${basedir}/package.zip`, `${basedir}/space/${footprint}/package.zip`, {overwrite:true})
        resolve({footprint, downzip:'package.zip'});
      });
  });
}

function _fetchFilePath(dir) {
  var results = [];
  fs.readdirSync(dir).forEach(function (file) {
    // console.log("dir:", dir,"file:",file);
    file = dir + "/" + file;
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(_fetchFilePath(file));
    } else {
      results.push(file);
      // console.log("file:", file);
    }
  });
  return results;
}

export default handle;

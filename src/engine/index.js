import { NETWORK } from "@/constants/network";
const fs = require("fs");
import async from 'async';
import crypto from "crypto";
import sha1 from "sha1";
import blake2b from "blake2b";
import { createCanvas, loadImage } from "canvas";
import NftStorage from "@/modules/NftStorage";
import {
  format,
  baseUri,
  description,
  background,
  uniqueDnaTorrance,
  rarityDelimiter,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
  text,
  namePrefix,
  network,
  solanaMetadata,
  gif,
} from "@/config/index";
const DNA_DELIMITER = "-";
import HashlipsGiffer from "@/modules/HashlipsGiffer";
import _ from "lodash";
const queueWorker = async (task) => {
  const { idx, hdl, collection, layersDir, config } = task;
  const buildDir = hdl.getBuildDir();
  const layers = hdl.layersSetup(config.layersOrder, layersDir);
  let newDna = hdl.createDna(layers);
  if (hdl.isDnaUnique(hdl.dnaList, newDna)) {
      let results = hdl.constructLayerToDna(newDna, layers);
      let loadedElements = [];

      results.forEach((layer) => {
        loadedElements.push(hdl.loadLayerImg(layer));
      });

      await Promise.all(loadedElements).then((renderObjectArray) => {
        debugLogs ? console.log("Clearing canvas") : null;
        hdl.ctx.clearRect(0, 0, format.width, format.height);
        if (gif.export) {
          hdl.hashlipsGiffer = new HashlipsGiffer(
            hdl.canvas,
            hdl.ctx,
            `${buildDir}/gifs/${idx}.gif`,
            gif.repeat,
            gif.quality,
            gif.delay
          );
          hdl.hashlipsGiffer.start();
        }
        if (background.generate) {
          hdl.drawBackground();
        }
        renderObjectArray.forEach((renderObject, index) => {
          hdl.drawElement(renderObject, index, config.layersOrder.length);
          if (gif.export) {
            hdl.hashlipsGiffer.add();
          }
        });
        if (gif.export) {
          hdl.hashlipsGiffer.stop();
        }
          hdl.saveImage(idx);
          hdl.addMetadata(newDna, idx, collection);
          hdl.saveMetaDataSingleFile(idx);
        console.log(
          `Created edition: ${idx}, with DNA: ${sha1(newDna)}`
        );
      });
      hdl.dnaList.add(hdl.filterDNAOptions(newDna));
    } else {
      console.log("DNA exists!");
      failedCount++;
      if (failedCount >= uniqueDnaTorrance) {
        console.log(
          `You need more layers or elements to grow your edition to ${config.growEditionSizeTo} artworks!`
        );
      }
    }
  


}
class HashLipEngine {
  constructor(layersConfig, collection, layersDir, footprint) {
    this.layersConfig = layersConfig;
    this.collection = collection;
    this.layersDir = layersDir;
    this.footprint = footprint;
    this.queue = async.queue(async function(task, callback) {
      await queueWorker(task);
      callback();
    }, 100);

    const canvas = createCanvas(format.width, format.height);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = format.smoothing;

    this.canvas = canvas;
    this.ctx = ctx;

    this.metadataList = [];
    this.tokenList = [];
    this.collectiondata = {};
    this.attributesList = [];
    this.dnaList = new Set();
    this.hashlipsGiffer = null;
  }

  buildSetup = () => {
    const basePath = process.cwd();
    const footprint = this.footprint;
    const buildDir = `${basePath}/space/${footprint}/build`;
    if (fs.existsSync(buildDir)) {
      fs.rmdirSync(buildDir, { recursive: true });
    }
    fs.mkdirSync(buildDir);
    fs.mkdirSync(`${buildDir}/json`);
    fs.mkdirSync(`${buildDir}/images`);
    if (gif.export) {
      fs.mkdirSync(`${buildDir}/gifs`);
    }

    this.buildDir = buildDir;
  };

  getBuildDir = () => {
    return this.buildDir;
  }
  
  getRarityWeight = (_str) => {
    let nameWithoutExtension = _str.slice(0, -4);
    var nameWithoutWeight = Number(
      nameWithoutExtension.split(rarityDelimiter).pop()
    );
    if (isNaN(nameWithoutWeight)) {
      nameWithoutWeight = 1;
    }
    return nameWithoutWeight;
  };
  
  cleanDna = (_str) => {
    const withoutOptions = this.removeQueryStrings(_str);
    var dna = Number(withoutOptions.split(":").shift());
    return dna;
  };
  
  cleanName = (_str) => {
    let nameWithoutExtension = _str.slice(0, -4);
    var nameWithoutWeight = nameWithoutExtension.split(rarityDelimiter).shift();
    return nameWithoutWeight;
  };
  
  getElements = (path) => {
    return fs
      .readdirSync(path)
      .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
      .map((i, index) => {
        if (i.includes("-")) {
          throw new Error(`layer name can not contain dashes, please fix: ${i}`);
        }
        return {
          id: index,
          name: this.cleanName(i),
          filename: i,
          path: `${path}${i}`,
          weight: this.getRarityWeight(i),
        };
      });
  };
  
  layersSetup = (layersOrder, layersDir) => {
    // console.log("layersSetup:", layersOrder, layersDir);
    const layers = layersOrder.map((layerObj, index) => ({
      id: index,
      elements: this.getElements(`${layersDir}/${layerObj.name}/`),
      name:
        layerObj.options?.["displayName"] != undefined
          ? layerObj.options?.["displayName"]
          : layerObj.name,
      blend:
        layerObj.options?.["blend"] != undefined
          ? layerObj.options?.["blend"]
          : "source-over",
      opacity:
        layerObj.options?.["opacity"] != undefined
          ? layerObj.options?.["opacity"]
          : 1,
      bypassDNA:
        layerObj.options?.["bypassDNA"] !== undefined
          ? layerObj.options?.["bypassDNA"]
          : false,
    }));
    return layers;
  };
  
  saveImage = (_editionCount) => {
    const buildDir = this.getBuildDir();
    fs.writeFileSync(
      `${buildDir}/images/${_editionCount}.png`,
      this.canvas.toBuffer("image/png")
    );
  };
  
  genColor = () => {
    let hue = Math.floor(Math.random() * 360);
    let pastel = `hsl(${hue}, 100%, ${background.brightness})`;
    return pastel;
  };
  
  drawBackground = () => {
    this.ctx.fillStyle = background.static ? background.default : this.genColor();
    this.ctx.fillRect(0, 0, format.width, format.height);
  };
  
  addMetadata = async (_dna, _edition, _collection) => {
    const buildDir = this.getBuildDir();
    const {
      collectionName,
      total,
      mintType,
      creator,
      mintPrice,
      royalties,
      description,
      whiteList,
      mintStart,
      premintEnd,
    } = _collection;
    const sha256hash = crypto.createHash("sha256").update(fs.readFileSync(`${buildDir}/images/${_edition}.png`)).digest("hex")
    let tempMetadata = {
      name: `${collectionName} #${_edition}`,
      description: description,
      "content-hash": sha256hash,
      spec: {
        type: "normal",
        value: {
          attributes: this.attributesList,
        },
      },
      "collection-name": collectionName,
      "content-uri": {
        scheme: "ipfs://",
        data: "CID",
      },
      "marmalade-token-id": "",
      // image: `${baseUri}/${_edition}.png`,
      dna: sha1(_dna),
      edition: _edition,
      creator: creator,
      "current-owner": "",
      "current-owner-guard": {},
      revealed: false,
      minted: false,
    };
    if (network == NETWORK.sol) {
      tempMetadata = {
        //Added metadata for solana
        name: tempMetadata.name,
        symbol: solanaMetadata.symbol,
        description: tempMetadata.description,
        //Added metadata for solana
        seller_fee_basis_points: solanaMetadata.seller_fee_basis_points,
        image: `${_edition}.png`,
        //Added metadata for solana
        external_url: solanaMetadata.external_url,
        edition: _edition,
        ...extraMetadata,
        attributes: tempMetadata.attributes,
        properties: {
          files: [
            {
              uri: `${_edition}.png`,
              type: "image/png",
            },
          ],
          category: "image",
          creators: solanaMetadata.creators,
        },
      };
    }

    const cid = await NftStorage.storeNFT(`${buildDir}/images/${_edition}.png`);
    tempMetadata["content-uri"].scheme = `ipfs://${cid}`
    tempMetadata["content-uri"].data = cid;
    this.metadataList.push(tempMetadata);
    
    let tempTokendata = {
      hash:sha256hash,
      spec: {
        type:"normal",
        value: {
          attributes:this.attributesList,
        },
      },
      "content_uri": {
        scheme: `ipfs://${cid}`,
        data: cid,
      }
    }
    this.tokenList.push(tempTokendata);
    this.collectiondata = {
      creator: creator,
      description: description,
      name: collectionName,
      "provenance-hash": "",
      "mint-starts": mintStart,
      "premint-ends": premintEnd,
      size: parseInt(total),
      "token-list": this.tokenList,
      "mint-price": parseFloat(mintPrice),
      "mint-royalties": {
        "rates": [{
        "description": "creator",
        "stakeholder": "k:047bc663e6cdaccb268e224765645dd11573091f9ff2ac083508b46a0647ace0",
        "rate": 0.975
      }, {
        "description": "mintit",
        "stakeholder": "k:d46967fd03942c50f0d50edc9c35d018fe01166853dc79f62e2fdf72689e0484",
        "rate": 0.025
      }]
    },
      "sale-royalties": {
        "rates": []
      },
      "premint-whitelist": whiteList,
      "type": mintType
    };
    this.attributesList = [];
  };
  
  addAttributes = (_element) => {
    let selectedElement = _element.layer.selectedElement;
    this.attributesList.push({
      trait_type: _element.layer.name,
      value: selectedElement.name,
    });
  };
  
  loadLayerImg = async (_layer) => {
    try {
      return new Promise(async (resolve) => {
        const image = await loadImage(`${_layer.selectedElement.path}`);
        resolve({ layer: _layer, loadedImage: image });
      });
    } catch (error) {
      console.error("Error loading image:", error);
    }
  };
  
  addText = (_sig, x, y, size) => {
    this.ctx.fillStyle = text.color;
    this.ctx.font = `${text.weight} ${size}pt ${text.family}`;
    this.ctx.textBaseline = text.baseline;
    this.ctx.textAlign = text.align;
    this.ctx.fillText(_sig, x, y);
  };
  
  drawElement = (_renderObject, _index, _layersLen) => {
    this.ctx.globalAlpha = _renderObject.layer.opacity;
    this.ctx.globalCompositeOperation = _renderObject.layer.blend;
    text.only
      ? this.addText(
          `${_renderObject.layer.name}${text.spacer}${_renderObject.layer.selectedElement.name}`,
          text.xGap,
          text.yGap * (_index + 1),
          text.size
        )
      : this.ctx.drawImage(
          _renderObject.loadedImage,
          0,
          0,
          format.width,
          format.height
        );
  
    this.addAttributes(_renderObject);
  };
  
  constructLayerToDna = (_dna = "", _layers = []) => {
    let mappedDnaToLayers = _layers.map((layer, index) => {
      let selectedElement = layer.elements.find(
        (e) => e.id == this.cleanDna(_dna.split(DNA_DELIMITER)[index])
      );
      return {
        name: layer.name,
        blend: layer.blend,
        opacity: layer.opacity,
        selectedElement: selectedElement,
      };
    });
    return mappedDnaToLayers;
  };
  
  /**
   * In some cases a DNA string may contain optional query parameters for options
   * such as bypassing the DNA isUnique check, this function filters out those
   * items without modifying the stored DNA.
   *
   * @param {String} _dna New DNA string
   * @returns new DNA string with any items that should be filtered, removed.
   */
  filterDNAOptions = (_dna) => {
    const dnaItems = _dna.split(DNA_DELIMITER);
    const filteredDNA = dnaItems.filter((element) => {
      const query = /(\?.*$)/;
      const querystring = query.exec(element);
      if (!querystring) {
        return true;
      }
      const options = querystring[1].split("&").reduce((r, setting) => {
        const keyPairs = setting.split("=");
        return { ...r, [keyPairs[0]]: keyPairs[1] };
      }, []);
  
      return options.bypassDNA;
    });
  
    return filteredDNA.join(DNA_DELIMITER);
  };
  
  /**
   * Cleaning function for DNA strings. When DNA strings include an option, it
   * is added to the filename with a ?setting=value query string. It needs to be
   * removed to properly access the file name before Drawing.
   *
   * @param {String} _dna The entire newDNA string
   * @returns Cleaned DNA string without querystring parameters.
   */
  removeQueryStrings = (_dna) => {
    const query = /(\?.*$)/;
    return _dna.replace(query, "");
  };
  
  isDnaUnique = (_DnaList = new Set(), _dna = "") => {
    const _filteredDNA = this.filterDNAOptions(_dna);
    return !_DnaList.has(_filteredDNA);
  };
  
  createDna = (_layers) => {
    let randNum = [];
    _layers.forEach((layer) => {
      var totalWeight = 0;
      layer.elements.forEach((element) => {
        totalWeight += element.weight;
      });
      // number between 0 - totalWeight
      let random = Math.floor(Math.random() * totalWeight);
      for (var i = 0; i < layer.elements.length; i++) {
        // subtract the current weight from the random weight until we reach a sub zero value.
        random -= layer.elements[i].weight;
        if (random < 0) {
          return randNum.push(
            `${layer.elements[i].id}:${layer.elements[i].filename}${
              layer.bypassDNA ? "?bypassDNA=true" : ""
            }`
          );
        }
      }
    });
    return randNum.join(DNA_DELIMITER);
  };
  
  writeMetaData = (_data) => {
    const buildDir = this.getBuildDir();
    fs.writeFileSync(`${buildDir}/json/_metadata.json`, _data);
  };
  
  writeCollectionData = (_data) => {
    const buildDir = this.getBuildDir();
    fs.writeFileSync(`${buildDir}/json/nft-collection.json`, _data);
  };

  calcProvenanceHash = (nfts) => {
    let hashList = [];
    let output = new Uint8Array(32) // 256 bit
    nfts.forEach(nft => {
      let input = Buffer.from(JSON.stringify(nft));
      const singleHash = blake2b(output.length).update(input).digest('hex');
      hashList.push(singleHash);
    })
    let input = Buffer.from(JSON.stringify(hashList.sort()));
    const hash = blake2b(output.length).update(input).digest('hex');
    console.log('hash:', hash);
    return hash;
  }
  
  saveMetaDataSingleFile = (_editionCount) => {
    const buildDir = this.getBuildDir();
    let metadata = this.metadataList.find((meta) => meta.edition == _editionCount);
    debugLogs
      ? console.log(
          `Writing metadata for ${_editionCount}: ${JSON.stringify(metadata)}`
        )
      : null;
    fs.writeFileSync(
      `${buildDir}/json/${_editionCount}.json`,
      JSON.stringify(metadata, null, 2)
    );
  };
  
  shuffle = (array) => {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  }
  
  startCreating = async (config, collection, layersDir) => {
    const buildDir = this.getBuildDir();
    let editionCount = 1;
    let failedCount = 0;
    let abstractedIndexes = [];
    for (
      let i = network == NETWORK.sol ? 0 : 1;
      i <= config.growEditionSizeTo;
      i++
    ) {
      abstractedIndexes.push(i);
    }
    if (shuffleLayerConfigurations) {
      abstractedIndexes = this.shuffle(abstractedIndexes);
    }
    debugLogs
      ? console.log("Editions left to create: ", abstractedIndexes)
      : null;
    const layers = this.layersSetup(config.layersOrder, layersDir);
    while (editionCount <= config.growEditionSizeTo) {
      let newDna = this.createDna(layers);
      if (this.isDnaUnique(this.dnaList, newDna)) {
        let results = this.constructLayerToDna(newDna, layers);
        let loadedElements = [];
  
        results.forEach((layer) => {
          loadedElements.push(this.loadLayerImg(layer));
        });
  
        await Promise.all(loadedElements).then(async(renderObjectArray) => {
          debugLogs ? console.log("Clearing canvas") : null;
          this.ctx.clearRect(0, 0, format.width, format.height);
          if (gif.export) {
            this.hashlipsGiffer = new HashlipsGiffer(
              this.canvas,
              this.ctx,
              `${buildDir}/gifs/${abstractedIndexes[0]}.gif`,
              gif.repeat,
              gif.quality,
              gif.delay
            );
            this.hashlipsGiffer.start();
          }
          if (background.generate) {
            this.drawBackground();
          }
          renderObjectArray.forEach((renderObject, index) => {
            this.drawElement(renderObject, index, config.layersOrder.length);
            if (gif.export) {
              this.hashlipsGiffer.add();
            }
          });
          if (gif.export) {
            this.hashlipsGiffer.stop();
          }
          debugLogs
            ? console.log("Editions left to create: ", abstractedIndexes)
            : null;
          this.saveImage(abstractedIndexes[0]);
          await this.addMetadata(newDna, abstractedIndexes[0], collection);
          this.saveMetaDataSingleFile(abstractedIndexes[0]);
          console.log(
            `Created edition: ${abstractedIndexes[0]}, with DNA: ${sha1(newDna)}`
          );
        });
        this.dnaList.add(this.filterDNAOptions(newDna));
        editionCount++;
        abstractedIndexes.shift();
      } else {
        console.log("DNA exists!");
        failedCount++;
        if (failedCount >= uniqueDnaTorrance) {
          console.log(
            `You need more layers or elements to grow your edition to ${config.growEditionSizeTo} artworks!`
          );
        }
      }
    }
  
    this.writeMetaData(JSON.stringify(this.metadataList, null, 2));
    this.collectiondata["provenance-hash"] = Buffer.from(this.calcProvenanceHash(this.collectiondata['token-list'])).toString('base64');
    this.writeCollectionData(JSON.stringify(this.collectiondata, null, 2));
  };

  startCreatingAsync = async (config, collection, layersDir) => {
    const buildDir = this.getBuildDir();
    let abstractedIndexes = [];
    for (
      let i = network == NETWORK.sol ? 0 : 1;
      i <= config.growEditionSizeTo;
      i++
    ) {
      abstractedIndexes.push(i);
    }
    if (shuffleLayerConfigurations) {
      abstractedIndexes = this.shuffle(abstractedIndexes);
    }
    debugLogs
      ? console.log("Editions left to create: ", abstractedIndexes)
      : null;

      const taskCtxs = abstractedIndexes.map(idx => {
        const ctx = {};
        ctx.idx = idx;
        ctx.hdl = this;
        ctx.collection = collection;
        ctx.layersDir = layersDir;
        ctx.config = config;
        return ctx;
      })
      this.queue.push(taskCtxs, function (err) {
        // console.log('sucessfully');
      });
      this.queue.drain(() => {
        this.writeMetaData(JSON.stringify(this.metadataList, null, 2));
        this.collectiondata["provenance-hash"] = Buffer.from(this.calcProvenanceHash(this.collectiondata['token-list'])).toString('base64');

        this.writeCollectionData(JSON.stringify(this.collectiondata, null, 2));
        console.log('all items have been processed');
      })  
    // this.writeMetaData(JSON.stringify(this.metadataList, null, 2));
    // this.writeCollectionData(JSON.stringify(this.collectiondata, null, 2));
  };
}

module.exports = HashLipEngine

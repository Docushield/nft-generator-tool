const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
import { preview, preview_gif, format } from "@/config/index";


import HashlipsGiffer from "@/modules/HashlipsGiffer";

const loadImg = async (_img) => {
  return new Promise(async (resolve) => {
    const loadedImage = await loadImage(`${_img}`);
    resolve({ loadedImage: loadedImage });
  });
};

class HashLipPreview {
  constructor(footprint) {
    const basePath = process.cwd();
    const buildDir = `${basePath}/space/${footprint}/build`;
    this.footprint = footprint;
    this.buildDir = buildDir;
    this.imageDir = `${buildDir}/images`;
    this.jsonDir = `${buildDir}/json`;
    const canvas = createCanvas(format.width, format.height);
    const ctx = canvas.getContext("2d");
    this.ctx = ctx;
    this.canvas = canvas;
    this.hashlipsGiffer = null;
  }

  async previewGif() {
    const imageList = [];
    const imageDir = this.imageDir;
    const buildDir = this.buildDir;
    const rawdata = fs.readdirSync(imageDir).forEach((file) => {
      imageList.push(loadImg(`${imageDir}/${file}`));
    });

    // Extract from preview config
    const { numberOfImages, order, repeat, quality, delay, imageName } =
      preview_gif;
    // Extract from format config
    const { width, height } = format;
    // Prepare canvas
    const previewCanvasWidth = width;
    const previewCanvasHeight = height;

    if (imageList.length < numberOfImages) {
      console.log(
        `You do not have enough images to create a gif with ${numberOfImages} images.`
      );
      return false;
    } else {
      // Shout from the mountain tops
      console.log(
        `Preparing a ${previewCanvasWidth}x${previewCanvasHeight} project preview with ${imageList.length} images.`
      );
      const previewPath = `${buildDir}/${imageName}`;

      this.ctx.clearRect(0, 0, width, height);

      this.hashlipsGiffer = new HashlipsGiffer(
        this.canvas,
        this.ctx,
        `${previewPath}`,
        repeat,
        quality,
        delay
      );
      this.hashlipsGiffer.start();

      await Promise.all(imageList).then((renderObjectArray) => {
        // console.log("renderObjectArray:", renderObjectArray);
        // Determin the order of the Images before creating the gif
        if (order == "ASC") {
          // Do nothing
        } else if (order == "DESC") {
          renderObjectArray.reverse();
        } else if (order == "MIXED") {
          renderObjectArray = renderObjectArray.sort(() => Math.random() - 0.5);
        }

        // Reduce the size of the array of Images to the desired amount
        if (parseInt(numberOfImages) > 0) {
          renderObjectArray = renderObjectArray.slice(0, numberOfImages);
        }

        renderObjectArray.forEach((renderObject, index) => {
          this.ctx.globalAlpha = 1;
          this.ctx.globalCompositeOperation = "source-over";
          this.ctx.drawImage(
            renderObject.loadedImage,
            0,
            0,
            previewCanvasWidth,
            previewCanvasHeight
          );
          this.hashlipsGiffer.add();
        });
      });
      this.hashlipsGiffer.stopSync();
      return previewPath;
    }
  }

  async preview() {
    const buildDir = this.buildDir;
    const jsonFile = `${buildDir}/json/_metadata.json`;
    const rawdata = fs.readFileSync(jsonFile);
    const metadataList = JSON.parse(rawdata);

    // Extract from preview config
    const { thumbWidth, thumbPerRow, imageRatio, imageName } = preview;
    // Calculate height on the fly
    const thumbHeight = thumbWidth * imageRatio;
    // Prepare canvas
    const previewCanvasWidth = thumbWidth * thumbPerRow;
    const previewCanvasHeight =
      thumbHeight * Math.ceil(metadataList.length / thumbPerRow);
    // Shout from the mountain tops
    console.log(
      `Preparing a ${previewCanvasWidth}x${previewCanvasHeight} project preview with ${metadataList.length} thumbnails.`
    );

    // Initiate the canvas now that we have calculated everything
    const previewPath = `${buildDir}/${imageName}`;
    const previewCanvas = createCanvas(previewCanvasWidth, previewCanvasHeight);
    const previewCtx = previewCanvas.getContext("2d");

    // Iterate all NFTs and insert thumbnail into preview image
    // Don't want to rely on "edition" for assuming index
    for (let index = 0; index < metadataList.length; index++) {
      const nft = metadataList[index];
      await loadImage(`${buildDir}/images/${nft.edition}.png`).then((image) => {
        previewCtx.drawImage(
          image,
          thumbWidth * (index % thumbPerRow),
          thumbHeight * Math.trunc(index / thumbPerRow),
          thumbWidth,
          thumbHeight
        );
      });
    }

    // Write Project Preview to file
    fs.writeFileSync(previewPath, previewCanvas.toBuffer("image/png"));
    console.log(`Project preview image located at: ${previewPath}`);

    return previewPath;
  }
}

module.exports = HashLipPreview;

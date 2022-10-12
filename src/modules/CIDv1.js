import _ from "lodash";
import { NFTStorage, File } from "nft.storage";
import mime from "mime";
import path from "path";
import fs from "fs";
import { packToBlob } from 'ipfs-car/pack/blob'
import { MemoryBlockStore } from 'ipfs-car/blockstore/memory' // You can also use the `level-blockstore` module

class CIDv1 {
  constructor() {
  }

  static getInstance() {
    if (!CIDv1.instance) {
      CIDv1.instance = new CIDv1();
    }
    return CIDv1.instance;
  }

  /**
 * Convert the passed blob to an "import candidate" - an object suitable for
 * passing to the ipfs-unixfs-importer. Note: content is an accessor so that
 * the stream is created only when needed.
 *
 * @param {string} path
 * @param {Pick<Blob, 'stream'>|{ stream: () => AsyncIterable<Uint8Array> }} blob
 * @returns {import('ipfs-core-types/src/utils.js').ImportCandidate}
 */
   toImportCandidate = (path, blob) => {
  /** @type {AsyncIterable<Uint8Array>} */
  let stream
  return {
    path,
    get content() {
      stream = stream || blob.stream()
      return stream
    },
  }
}

async fileFromPath(filePath) {
  const content = await fs.promises.readFile(filePath);
  const type = mime.getType(filePath);
  return new File([content], path.basename(filePath), { type });
}

  calcCIDv1 = async (imagePath) => {
    // load the file from disk
    const image = await this.fileFromPath(imagePath);
    const { root, car } = await packToBlob({
      input: [this.toImportCandidate('blob', image)],
      blockstore: new MemoryBlockStore(),
      wrapWithDirectory:false
    })
    const cid = root.toString();
    console.log("image:",imagePath, "CIDv1:",cid);
    return cid;
  };


}

module.exports = CIDv1.getInstance();

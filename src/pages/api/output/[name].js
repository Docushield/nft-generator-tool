import path from 'path'
import fs from 'fs';
import _ from 'lodash';
export const config = {
  api: {
    responseLimit: false,
  },
}

async function handle(req, res) {
    const { method,body, query} = req;
    switch (method) {
      case "GET":
        await handleGet(query, res);
        break;
      default:
        res.setHeader("Allow", ["Get"]);
        res.status(405).end(`Method ${method} Not Allowed`);
        break;
    }
  }
  
  async function handleGet(query, res) {
    console.log("data:", query);
    const footprint = _.trimEnd(query.name,'.zip');
    const storageDir = process.env.STORAGE;
    const filePath = path.join(storageDir, `/${footprint}/package.zip`);
    try {
      const zipBuffer = fs.readFileSync(filePath);
    //   console.log(zipBuffer)
      var stat = fs.statSync(filePath);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader( 'Content-Length', stat.size);
      res.send(zipBuffer);
    // res.status(200).json({});
    } catch (e) {
      res.status(400).json({ error: true, message: 'zipfile not found' });
    }
  }
  
  
  export default handle
import formidable from "formidable";
import fs from 'fs'
import fse from 'fs-extra'
import path from 'path'
export const config = {
  api: {
    bodyParser: false,
  },
};

const handle = async (req, res) => {
  const rootdir = process.cwd();
  const uploadDir = `${rootdir}/space/upload/`
  fse.ensureDirSync(uploadDir);
  const form = new formidable.IncomingForm();
  form.uploadDir = uploadDir;
  // console.log(form.uploadDir);
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    // console.log(err, fields, files);
    const [filename, fileHdl]= Object.entries(files)[0];
    // console.log("filename:", filename, "file:", fileHdl);
    fs.renameSync(fileHdl.filepath,`${uploadDir}/${fileHdl.newFilename}.zip`);
    res.status(200).json({filename: `${fileHdl.newFilename}.zip`});
  });
};


export default handle

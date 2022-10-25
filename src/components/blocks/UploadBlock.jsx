import React,{useState} from "react";
import Image from "next/image";
import logo from "@/assets/logo.png";
import _ from "lodash";
import { useAppContext } from "@/state/context";
import {getSourceZipFile} from "@/state/actions";
import JSZip from "jszip";
export default function UploadBlock() {
    const { state, dispatch } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [btnTxt, setBtntxt] = useState('Click to upload');
    const [statMsg, setStatMsg] = useState("")
    const handelOnChange = async (e) => {
        if (loading) return;
        setLoading(true);
        setStatMsg("");
        setBtntxt("Processing...")
        
        const file = e.target.files[0];
        if (file.size <=0 || file.size>1*1024*1024*1024) {
            setStatMsg("over Max Size 1GB");
            return false;
        }

        // const zip = new JSZip();
        // zip.loadAsync(file).then(zipHdl => {

        //   zipHdl.forEach(function (relativePath, zipEntry) {  
        //     console.log("path:", relativePath);
        // });
        // }, reason => {
        //   console.log(reason.message);
        // });
        const formData = new FormData();
        const headers = new Headers();
        formData.append("source.zip",file);
        const response = await fetch("/api/upload", {
            method: "POST",
            headers: headers,
            body: formData,
          }).then(res => {
            return res.json();
          })
         console.log(response);

         setLoading(false);
         setBtntxt('Click to upload')
         setStatMsg("upload successfully.")
         dispatch(getSourceZipFile(response.filename));
      };
  return (
    <div className="px-2">
      <div className="flex justify-center items-center w-full"><Image src={logo} className="mr-6" alt="Mint" width={250} height={200} /></div>

      <div className="flex justify-center items-center w-full">
        <label
          htmlFor="upload"
          className="flex flex-col justify-center items-center w-full h-64 bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        >
          <div className="flex flex-col justify-center items-center pt-5 pb-6">
            <svg
              aria-hidden="true"
              className="mb-3 w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">{btnTxt}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Zip package (only include image file)
            </p>
          </div>
          <input id="upload" type="file" className="hidden" onChange={(e) => handelOnChange(e)} />
        </label>
      </div>
      <div>{statMsg}</div>
    </div>
  );
}

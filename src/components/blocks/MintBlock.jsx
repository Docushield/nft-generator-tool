import React, { useState } from "react";
import Image from 'next/image'
import nftImg from "@/assets/preview.png";
import PrimaryButton from "@/components/ui/PrimaryButton";
import iconEdit from "@/assets/icon-edit.png";
import axios from "axios";
import { useAppContext } from "@/state/context";
import {updateCollection} from "@/state/actions"
import moment from "moment";
export default function MintBlock() {
  const { state, dispatch } = useAppContext();
  const {collection, organizeData, sourceZip} = state;
  const [wlOpen, setWlOpen] = useState('wlopen');
  const [mintType, setMintType] = useState('public');
  const [fileContent, setFileContent] = useState("");
  const formHandler = (e) => {
    e.preventDefault();
  };

  const inputChangeHandler = (e) => {
    e.preventDefault()
    console.log("value:", e.target.value, "name:", e.target.name);
    collection[e.target.name] = e.target.value;
    dispatch(updateCollection(collection));
    console.log(collection);
    console.log("value:", e.target.value, "name:", e.target.name);
  };

  const mintTypeHandler = (e) => {
    e.preventDefault()
    setMintType(e.target.value)
    collection.mintType = e.target.value;
    dispatch(updateCollection(collection));
  }

  const handleUploadWL = (event) => {
    console.log(event);
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      console.log("file:",file);
      const fileReader = new FileReader();
      fileReader.readAsText(file, "UTF-8");
      fileReader.onload = e => {
        const content = e.target.result;
        console.log(content);
        setFileContent(JSON.parse(content));
        collection.whiteList = JSON.parse(content);
        dispatch(updateCollection(collection));
      };
    }
  }

  const mintTimeHandler = (event) => {
    event.preventDefault()
    console.log("value:",event.target.value, "name:", event.target.name);
    const utc = moment(event.target.value).utc().format()
    collection[event.target.name] = utc;
    dispatch(updateCollection(collection));
  }


  const letsMintHandler = async () => {
    collection.mintType = mintType;
    dispatch(updateCollection(collection));

    const rs = await generateOutputfile()
    
    if (rs.status == 200) {
      console.log(rs.data);
      const {footprint, download} = rs.data.download;
      await downloadOutputFile(footprint)
    }
    
  }

  const generateOutputfile = async () => {
    const payload = {collection:collection, organizeData:organizeData, sourceZip:sourceZip }
    const res = await axios.post('/api/generate', payload,{baseURL:process.env.NEXT_PUBLIC_API_URL});
    console.log(res);
    return res;
  }



  const downloadOutputFile = async (footprint) => {
    await axios({
      url: `/api/download/${footprint}.zip`,
      method: 'GET',
      responseType: 'blob', // important
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${footprint}.zip`);
      document.body.appendChild(link);
      link.click();
    });
  }

  return (
    <section className="px-6">
      <form
        onSubmit={formHandler}
        className="flex justify-between items-center"
      >
        <div className="px-1">
          <div className="mx-2 mb-5">
            <div className="uppercase w-full text-gray my-2 font-medium">
              Collection Name
            </div>
            <input
              type={"text"}
              placeholder="Your collection name"
              className="px-4 py-2 w-56 rounded-md"
              onChange={inputChangeHandler}
              name="collectionName"
            ></input>
          </div>
          <div className="flex mx-2 mb-5">
            <div className="py-1">
              <div className="uppercase text-gray my-2 font-medium">
                # OF NFTS
              </div>
              <input
                type={"number"}
                placeholder="10-10,000"
                onChange={inputChangeHandler}
                className="px-4 py-2 w-32 rounded-md"
                name="total"
              ></input>
            </div>
            <div className="py-1 mx-3">
              <div className="uppercase  text-gray my-2 font-medium">
                MINT TYPE
              </div>
              <div className="text-gray grid grid-cols-2 gap-1 items-center">
                <div>
                  <input type={"radio"} className="mr-1" onChange={e => setMintType(e.target.value)} defaultChecked={mintType==='private'} value={"private"} name={"mintTypeRadio"}></input>
                  <label className="uppercase text-gray">private</label>
                </div>
                <div>
                  <input type={"radio"} className="mr-1" defaultChecked={mintType=='public'} onChange={e => setMintType(e.target.value)} value={"public"} name={"mintTypeRadio"}></input>
                  <label className="uppercase text-gray">public</label>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-2 mb-5">
            <div className="uppercase  text-gray my-2 font-medium">
              Creator K:Address
            </div>
            <input
              type={"text"}
              placeholder="k:address"
              onChange={inputChangeHandler}
              name="creator"
              className="px-4 py-2 w-80 rounded-md "
            ></input>
          </div>
          <div className="flex mx-2 mb-5 justify-between">
            <div>
              <div className="uppercase  text-gray my-2 font-medium">
                Mint price
              </div>
              <input
                type={"text"}
                placeholder="Value in KDA"
                onChange={inputChangeHandler}
                name="mintPrice"
                className="px-4 py-2 w-36 rounded-md "
              ></input>
            </div>
            <div>
              <div className="uppercase text-gray my-2">ROYALTIES</div>
              <input
                type={"number"}
                placeholder="5%"
                name="royalties"
                onChange={inputChangeHandler}
                className="px-4 py-2 w-36 rounded-md "
              ></input>
            </div>
          </div>

          <div className="mx-2 mb-5">
            <div className="uppercase  text-gray my-2 font-medium">
              START MINT
            </div>
            <input
              type={"date"}
              placeholder="2022-08-25"
              className="w-56 rounded-md "
              onChange={mintTimeHandler}
              name="mintStart"
            ></input>
          </div>
          <div className="mx-2 mb-5">
            <div className="uppercase  text-gray my-2 font-medium">
              DESCRIPTION
              <Image
                src={iconEdit}
                alt="icon"
                width={13}
                height={15}
                className="inline-block ml-1"
              ></Image>
            </div>
            <textarea
              placeholder="In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content."
              className="w-80 h-36 rounded-md"
              name="description"
              onChange={inputChangeHandler}
            ></textarea>
          </div>
          <div className="mx-2 mb-5 flex items-center justify-between">
            <div>
              <div className="uppercase text-gray my-2 font-medium">
                WHITELIST
              </div>
              <div className="flex items-center">
                <div className="text-gray grid grid-cols-2 gap-1 items-center">
                  <div>
                    <input type={"radio"} className="mr-1" onChange={e => setWlOpen(e.target.value)} defaultChecked={wlOpen=='wlclose'} value={'wlclose'} name={"wl"}></input>
                    <label className="uppercase">no</label>
                  </div>
                  <div>
                    <input type={"radio"} className="mr-1" value={"wlopen"} defaultChecked={wlOpen=='wlopen'} onChange={e => setWlOpen(e.target.value)} name={"wl"}></input>
                    <label className="uppercase">yes</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center py-2 pl-7">
            <label
              htmlFor="uploadWL"
              className="flex flex-col items-center md:gap-2 cursor-pointer"
            >
              <div className="rounded-sm shadow-sm uppercase border-blue border-4 w-32 h-7rounded-md bg-lightblue text-white font-medium ring-1 text-center">
              UPLOAD WL
              </div>
            </label>
            <input
              id="uploadWL"
              type="file"
              onChange={(e) => handleUploadWL(e)}
              className="hidden"
            ></input>
          </div>
          </div>
          <div className="mx-2 mb-5">
            <div className="uppercase  text-gray my-2 font-medium">
              End whitelist
            </div>
            <input
              type={"date"}
              placeholder="2022-08-25"
              onChange={mintTimeHandler}
              className="rounded-md px-4 py-2 w-56"
              name="premintEnd"
            ></input>
          </div>
        </div>
        <div className="px-5 py-3">
          <div className="shadow-md p-2 mb-3 rounded-lg bg-[#FCFCFC] ">
            <Image src={nftImg} alt="preview" className="p-6 w-64 h-72"></Image>
            <div className="border-t border-zinc-300 py-5">
              <span className="uppercase text-gray my-2 font-medium">
                preview
              </span>
            </div>
          </div>
          <div className="w-full">
            <PrimaryButton className="text-neutral-50 uppercase w-full bg-[#5BCA8E] outline-1 rounded-md shadow-md" onClick={() => {letsMintHandler()}}>
              LETS MINT
            </PrimaryButton>
          </div>
        </div>
      </form>
    </section>
  );
}

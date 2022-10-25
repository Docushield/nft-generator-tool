import React, { useState, useEffect } from "react";
import Image from "next/image";
import PrimaryButton from "@/components/ui/PrimaryButton";
import iconEdit from "@/assets/icon-edit.png";
import axios from "axios";
import moment from "moment";
import { useAppContext } from "@/state/context";

export default function MetaBlock() {
  const { state, dispatch } = useAppContext();
  const { sourceZip } = state;
  const [wlOpen, setWlOpen] = useState("wlopen");
  const [mintType, setMintType] = useState("public");
  const [collection, setCollection] = useState({
    collectionName:'',
    total:10,
    mintType:'public',
    creator:'',
    mintPrice:1,
    royalties:"5%",
    description:'',
    whiteList:[],
    mintStart:'',
    premintEnd:'',
    prefix:'',
  });
  const formHandler = (e) => {
    e.preventDefault();
  };
  const inputChangeHandler = (e) => {
    e.preventDefault();
    console.log("value:", e.target.value, "name:", e.target.name);
    let tags = ["mintPrice", "total"];
    if (tags.includes(e.target.name)) {
      if ("mintPrice" == e.target.name) {
        collection[e.target.name] =  parseFloat(e.target.value).toFixed(2);
        // console.log("mintPrice:",collection[e.target.name]);
      } else {
        collection[e.target.name] = parseInt(e.target.value);
      }
      
    }
    else {
      collection[e.target.name] = e.target.value;
    }
    // console.log(collection);

    setCollection({...collection});
  };


  const mintTypeHandler = (mintType) => {
    setMintType(mintType);
    // collection.mintType = mintType;
    setCollection({...collection, mintType});
  };

  const mintTimeHandler = (event) => {
    event.preventDefault();
    console.log("value:", event.target.value, "name:", event.target.name);
    const utc = moment(event.target.value).utc().format();
    collection[event.target.name] = utc;
    setCollection({...collection});
  };

  const handleUploadWL = (event) => {
    console.log(event);
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // console.log("file:",file);
      const fileReader = new FileReader();
      fileReader.readAsText(file, "UTF-8");
      fileReader.onload = (e) => {
        const content = e.target.result;
        console.log(content);
        collection.whiteList = JSON.parse(content);
        setCollection({...collection});
      };
    }
  };
  const letsMintHandler = async () => {
    const footprint = await generateOutputfile();
    await downloadOutputFile(footprint);
  };

  const generateOutputfile = async () => {
    const payload = {
      sourceZip: sourceZip,
      collection: collection
    };
    const footprint = await axios.post("/api/convert", payload).then((response) => {
      if (response.status == 200) {
        const { footprint } = response.data;
        console.log("footprint:", footprint);
        return footprint;
      }
    });
    return footprint;
  };

  const downloadOutputFile = async (footprint) => {
    await axios({
      url: `/api/output/${footprint}.zip`,
      method: "GET",
      responseType: "blob", // important
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${footprint}.zip`);
      document.body.appendChild(link);
      link.click();
    });
  };

  return (
    <div  className="px-2 w-full flex items-center flex-col justify-between">
      <form
        onSubmit={formHandler}
        className="px-1 w-10/12"
      >
          <div className="mx-2 mb-5">
            <div className="uppercase w-full text-gray my-2 font-medium">
              Collection Name
            </div>
            <input
              type={"text"}
              placeholder="Your collection name"
              className="px-4 py-2 rounded-md w-2/3"
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
                className="px-4 py-2 w-32 rounded-md  w-2/3"
                name="total"
              ></input>
            </div>
            <div className="py-1 mx-3">
              <div className="uppercase  text-gray my-2 font-medium">
                MINT TYPE
              </div>
              <div className="text-gray grid grid-cols-2 gap-1 items-center">
                <div>
                  <input
                    type={"radio"}
                    className="mr-1"
                    onChange={(e) => mintTypeHandler(e.target.value)}
                    defaultChecked={mintType === "private"}
                    value={"private"}
                    name={"mintTypeRadio"}
                  ></input>
                  <label className="uppercase text-gray">private</label>
                </div>
                <div>
                  <input
                    type={"radio"}
                    className="mr-1"
                    defaultChecked={mintType == "public"}
                    onChange={(e) => mintTypeHandler(e.target.value)}
                    value={"public"}
                    name={"mintTypeRadio"}
                  ></input>
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
              className="px-4 py-2 rounded-md  w-2/3"
            ></input>
          </div>
          <div className="mx-2 mb-5">
            <div className="uppercase  text-gray my-2 font-medium">
              Traits Prefix
            </div>
            <input
              type={"text"}
              placeholder="trait prefix"
              onChange={inputChangeHandler}
              name="prefix"
              className="px-4 py-2 rounded-md  w-2/3"
            ></input>
          </div>
          <div className="flex mx-2 mb-5">
            <div className="mr-2">
              <div className="uppercase  text-gray my-2 font-medium">
                Mint price
              </div>
              <input
                type={"text"}
                placeholder="Value in KDA"
                onChange={inputChangeHandler}
                name="mintPrice"
                className="px-4 py-2 rounded-md  w-2/3"
              ></input>
            </div>
            <div className="mr-2">
              <div className="uppercase text-gray my-2">ROYALTIES</div>
              <input
                type={"number"}
                placeholder="5%"
                name="royalties"
                onChange={inputChangeHandler}
                className="px-4 py-2 rounded-md  w-2/3"
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
              className="rounded-md  w-2/3"
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
              className="h-36 rounded-md  w-2/3"
              name="description"
              onChange={inputChangeHandler}
            ></textarea>
          </div>
          <div className="mx-2 mb-5 flex">
            <div>
              <div className="uppercase text-gray my-2 font-medium">
                WHITELIST
              </div>
              <div className="flex items-center">
                <div className="text-gray grid grid-cols-2 gap-1 items-center">
                  <div>
                    <input
                      type={"radio"}
                      className="mr-1"
                      onChange={(e) => setWlOpen(e.target.value)}
                      defaultChecked={wlOpen == "wlclose"}
                      value={"wlclose"}
                      name={"wl"}
                    ></input>
                    <label className="uppercase">no</label>
                  </div>
                  <div>
                    <input
                      type={"radio"}
                      className="mr-1"
                      value={"wlopen"}
                      defaultChecked={wlOpen == "wlopen"}
                      onChange={(e) => setWlOpen(e.target.value)}
                      name={"wl"}
                    ></input>
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
              className="rounded-md px-4 py-2 w-2/3"
              name="premintEnd"
            ></input>
          </div>
          <PrimaryButton
              className="text-neutral-50 uppercase w-1/2 bg-[#5BCA8E] outline-1 rounded-md shadow-md"
              onClick={() => {
                letsMintHandler();
              }}
            >
              LETS MINT
          </PrimaryButton>

      </form>
    </div>
  )
}

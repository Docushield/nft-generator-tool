import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import logo from '@/assets/logo.png';
import _ from 'lodash';
import LayerList from '@/components/LayerList';
import AttributeList from '@/components/AttributeList';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useAppContext } from '@/state/context';
import crypto from 'crypto';
import {
  updateCurrentAttributeId,
  updateCurrentLayerId,
  createOriginalData,
  createOrganizeData,
  updateOrganizeData,
  updateCurrentLayers,
  updateCurrentAttributes,
  getSourceZipFile,
} from '@/state/actions';

export default function AssetBlock() {
  const { state, dispatch } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [btnTxt, setBtntxt] = useState('Select Assets Folder');
  const { organizeData, currentLayers } = state;
  const handelOnChange = async (e) => {
    // console.log(e);
    setLoading(true);
    setBtntxt('Processing...');
    const zip = new JSZip();
    let originalData = [];
    let organizeData = [];
    for (const file of e.target.files) {
      const arr = _.split(file.webkitRelativePath, '/');
      if (arr.length == 3 && _.toLower(arr[2]).endsWith('.png')) {
        const hash = crypto.createHash('sha256').update(file.webkitRelativePath).digest('hex');
        zip.file(file.webkitRelativePath, file);
        let originalItem = {};
        originalItem.File = file;
        originalItem.path = file.webkitRelativePath;
        originalItem.fileHash = hash;
        // console.log(originalItem.fileHash);
        originalData.push(originalItem);

        const idx = _.findIndex(organizeData, (item) => {
          return item.name == arr[1];
        });
        if (idx == -1) {
          const slen = organizeData.length;
          let item = {
            name: arr[1],
            elements: [{ element: arr[2], idx: 0, hash: hash, rarity: 5 }],
            idx: slen,
          };
          organizeData.push(item);
        } else {
          const slen = organizeData[idx].elements.length;
          organizeData[idx].elements.push({ element: arr[2], idx: slen, hash: hash, rarity: 5 });
        }
      }
    }

    dispatch(createOriginalData(originalData));

    const response = await zip
      .generateAsync({ type: 'blob' })
      .then(async function (content) {
        // saveAs(content, "files.zip");

        const formData = new FormData();
        const headers = new Headers();
        formData.append('source.zip', content);
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: headers,
          body: formData,
        }).then((res) => {
          return res.json();
        });

        return response;
      })
      .catch((e) => console.log(e));
    setLoading(false);
    setBtntxt('Select Assets Folder');
    dispatch(updateCurrentAttributeId(0));
    dispatch(updateCurrentLayerId(0));
    dispatch(updateCurrentLayers(organizeData[0].elements));
    dispatch(createOrganizeData(organizeData));
    dispatch(getSourceZipFile(response.filename));
  };

  return (
    <section className="px-6 border-b border-b-gray xl:border-b-0 py-6 xl:py-0 xl:border-r xl:border-r-gray">
      <Image src={logo} className="mr-6" alt="Mint" width={250} height={200} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
        <div className="w-full">
          <div className="flex items-center py-2 pl-7">
            <label htmlFor="upload" className="flex flex-col items-center md:gap-2 cursor-pointer">
              <div className="py-3 px-3 border-blue border-4 w-[19em] rounded-md bg-lightblue text-white font-medium ring-1 text-center">
                {btnTxt}
              </div>
            </label>
            <input
              id="upload"
              type="file"
              directory=""
              webkitdirectory=""
              mozdirectory=""
              onChange={(e) => handelOnChange(e)}
              className="hidden"
            ></input>
          </div>
          {organizeData.length > 0 && <AttributeList dataList={organizeData} />}
        </div>
        {organizeData.length > 0 && <LayerList dataList={currentLayers} />}
      </div>
    </section>
  );
}

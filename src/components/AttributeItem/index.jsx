import classNames from "classnames";
import PropTypes from "prop-types";
import Image from "next/image";
import _ from "lodash";
import {
  BsArrowDown,
  BsArrowUp,
  BsFillCheckCircleFill,
  BsFillTrashFill,
  BsPencilSquare,
  BsFillXCircleFill,
} from "react-icons/bs";
import iconEdit from "@/assets/icon-edit.png";
import React, { useState } from "react";
import { useAppContext } from "@/state/context";
import {
  updateCurrentAttributeId,
  updateCurrentLayerId,
  createOriginalData,
  createOrganizeData,
  updateOrganizeData,
  updateCurrentLayers,
  updateCurrentAttributes,
} from "@/state/actions";

export default function AttributeItem({
  data,
  moveItem,
  deleteItem,
  editItem,
  className,
  ...props
}) {
  const { state, dispatch } = useAppContext();
  const { currentAttributeId, organizeData } = state;
  const cs = classNames(["p-2 bg-white w-96", className]);
  const [editing, setEditing] = useState(false);
  const [cacheVal, setCacheVal] = useState(data.name);
  const idx = data.idx;
  const moveItemHandler = (direct) => {
    console.log("key:", idx, "direct:", direct);
    moveItem(idx, direct);
  };

  const deleteItemHandler = () => {
    console.log("key:", idx, data);
    deleteItem(idx);
  };

  const editItemHandler = (name) => {
    console.log("key:", idx, "name:", name);
    setCacheVal(name);
  };

  const saveEditHandler = () => {
    editItem(idx, cacheVal);
    setEditing(false);
  };

  const cancelEditHandler = () => {
    setCacheVal(data.name);
    setEditing(false);
  };

  const activeHandler = (idx) => {
    dispatch(updateCurrentAttributeId(idx));
    const index = _.findIndex(organizeData, (o) => {
      return o.idx == idx;
    });
    dispatch(updateCurrentLayers(organizeData[index].elements));
  };

  return (
    <div
      className={cs}
      {...props}
      onClick={(e) => activeHandler(idx)}
    >
      {editing ? (
        <div className="flex items-center justify-between">
          <div>
            <BsArrowUp
              onClick={(e) => {
                moveItemHandler("up");
              }}
            />
            <BsArrowDown
              onClick={(e) => {
                moveItemHandler("down");
              }}
            />
          </div>
          <input
            type="text"
            className="w-full bg-gray-100 rounded p-3 border focus:outline-none focus:border-blue-500"
            value={cacheVal || ""}
            onChange={(e) => {
              editItemHandler(e.target.value);
            }}
          ></input>
          <div className="flex justify-center items-center">
            <BsFillCheckCircleFill color="green" size={24}
              onClick={() => {
                saveEditHandler();
              }}
            />
            <BsFillXCircleFill color="red"  size={24}
              onClick={() => {
                cancelEditHandler();
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <div>
            <BsArrowUp
              onClick={(e) => {
                moveItemHandler("up");
              }}
            />
            <BsArrowDown
              onClick={(e) => {
                moveItemHandler("down");
              }}
            />
          </div>
          
          <div className={classNames("border flex items-center justify-between w-10/12 py-4 rounded-md shadow border-zinc-500", { "bg-[#FFEDBD]": currentAttributeId == idx })}>
            <div className="text-[16px] leading-[19px] px-3 py-1 text-zinc-500">{cacheVal}</div>
            <div className="flex px-3 py-1">
              <Image
                src={iconEdit}
                alt="scale"
                className="inline-block"
                onClick={(e) => {
                  setEditing(!editing);
                }}
              ></Image>
              <BsFillTrashFill
                color="#999"
                size={20}
                onClick={(e) => {
                  deleteItemHandler();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

AttributeItem.propTypes = {
  className: PropTypes.string,
  data: PropTypes.object.isRequired,
  moveItem: PropTypes.func,
  deleteItem: PropTypes.func,
  editItem: PropTypes.func,
};

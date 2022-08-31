import React, {useState} from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import {
  BsArrowDown,
  BsArrowUp,
  BsFillCheckCircleFill,
  BsFillXCircleFill,
} from "react-icons/bs";
import { useAppContext } from "@/state/context";
import {updateCurrentAttributeId,updateCurrentLayerId,createOriginalData,createOrganizeData,updateOrganizeData,updateCurrentLayers,updateCurrentAttributes} from "@/state/actions"

export default function LayerItem({
  data,
  moveItem,
  deleteItem,
  editItem,
  className,
  ...props
}) {
  const { state, dispatch } = useAppContext();
  const {organizeData, currentAttributeId, currentLayers} = state
  const cs = classNames(["flex items-center p-2 bg-white w-96", className]);
  const [editing, setEditing] = useState(false);
  const [cacheVal, setCacheVal] = useState(data.element);
  const idx = data.idx;
  const moveItemHandler = (direct) => {
    console.log("key:", idx, "direct:", direct);
    moveItem(idx, direct);
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
    setCacheVal(data.element);
    setEditing(false);
  };

  const rarityHandler = (rarity) => {
    const index = _.findIndex(currentLayers, (layer) => {
      return layer.idx == idx;
    });

    if (index<0) return false;

    currentLayers[index].rarity = rarity;
    dispatch(updateCurrentLayers(currentLayers));
    
    const attrIndex = _.findIndex(organizeData, (item) => {
      return item.idx == currentAttributeId;
    });

    if (attrIndex<0) return false;
    organizeData[attrIndex].elements = currentLayers;
    dispatch(updateOrganizeData(organizeData));

  };

  return (
    <div className={cs} {...props}>
      <div>
        <BsArrowUp color="gray" onClick={(e) => {moveItemHandler('up')}}/>
        <BsArrowDown color="gray" onClick={(e) => {moveItemHandler('down')}}/>
      </div>
      {editing ? (
        <div className="flex items-center">
          <input
            type="text"
            value={cacheVal || ""}
            className="w-full bg-gray-100 rounded p-2 mr-2 border focus:outline-none focus:border-blue-500"
            onChange={(e) => {
              editItemHandler(e.target.value);
            }}
          ></input>
          <div className="flex justify-center items-center mr-1 pr-2">
            <BsFillCheckCircleFill
              size={24}
              color={"green"}
              onClick={() => {
                saveEditHandler();
              }}
            />
            <BsFillXCircleFill
              size={24}
              color={"red"}
              onClick={() => {
                cancelEditHandler();
              }}
            />
          </div>
        </div>
      ) : (
        <div
          className="uppercase border h-14 text-center rounded-md m-2 py-2 px-5 md:py-2 md:px-5 w-52 text-gray shadow border-zinc-500 bg-[#FFEDBD]"
          onClick={(e) => {
            setEditing(true);
          }}
        >
          {data.element}
        </div>
      )}
        <input
            type="text"
            placeholder="5%"
            size={3}
            onChange={(e) => {rarityHandler(e.target.value)}}
            className="border border-lightgray rounded-xl p-4 outline-none focus:border-primary w-16 h-2 text-gray"
        />
    </div>
  );
}

LayerItem.propTypes = {
  className: PropTypes.string,
  data: PropTypes.object.isRequired,
  moveItem: PropTypes.func,
  deleteItem: PropTypes.func,
  editItem: PropTypes.func,
};

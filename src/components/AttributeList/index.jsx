import React, { useState } from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import AttributeItem from "@/components/AttributeItem";
import _ from "lodash";
export default function AttributeList({
  children,
  dataList,
  className,
  ...props
}) {
  const [attributeList, setAttributeList] = useState(dataList);
  const cs = classNames([className]);

  const moveItem = (idx, direct) => {
    let index = _.findIndex(attributeList, (el) => {
      return el.idx == idx;
    });
    if (index < 0) return false;

    const slen = attributeList.length;
    let newIndex = direct == "up" ? index - 1 : index + 1;

    newIndex = newIndex < 0 ? newIndex + slen : newIndex;
    newIndex = newIndex >= slen ? newIndex - slen : newIndex;

    let stageItem = attributeList[newIndex];
    attributeList[newIndex] = attributeList[index];
    attributeList[index] = stageItem;

    console.log("move dataList:", attributeList);
    setAttributeList(attributeList);
  };
  const deleteItem = (idx) => {
    const newList = attributeList.filter((item) => {
      console.log("idx:", idx, "item.idx:", item.idx);
      return idx !== item.idx;
    });
    setAttributeList(newList);
  };
  const editItem = (idx, value) => {
    const newList = attributeList.map((item) => {
      if (item.idx === idx) {
        item.name = value;
      }
      return item;
    });
    setAttributeList(newList);
  };


  return (
    <div className={cs} {...props}>
      {attributeList.length > 0 &&
        attributeList.map((item, i) => {
          return (
            <AttributeItem
              key={item.idx}
              data={item}
              moveItem={moveItem}
              deleteItem={deleteItem}
              editItem={editItem}
            />
          );
        })}
      {children}
    </div>
  );
}

AttributeList.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  dataList: PropTypes.array.isRequired,
};

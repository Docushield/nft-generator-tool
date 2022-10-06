import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import LayerItem from '@/components/LayerItem';
import _ from 'lodash';
import { useAppContext } from '@/state/context';
import { updateOrganizeData, updateCurrentLayers } from '@/state/actions';
export default function LayerList({ children, dataList, className, ...props }) {
  const { state, dispatch } = useAppContext();
  console.log('state:', state);
  const { organizeData, currentAttributeId, currentLayers } = state;

  const cs = classNames(['w-full', className]);

  const moveItem = (idx, direct) => {
    console.log(idx, direct);
    // const newList = _.clone(currentLayers);
    let index = _.findIndex(currentLayers, (el) => {
      return el.idx == idx;
    });
    if (index < 0) return false;

    const slen = currentLayers.length;
    let newIndex = direct == 'up' ? index - 1 : index + 1;

    newIndex = newIndex < 0 ? newIndex + slen : newIndex;
    newIndex = newIndex >= slen ? newIndex - slen : newIndex;

    let stageItem = currentLayers[newIndex];
    currentLayers[newIndex] = currentLayers[index];
    currentLayers[index] = stageItem;
    dispatch(updateCurrentLayers(currentLayers));
  };
  const deleteItem = (idx) => {
    const newList = currentLayers.filter((item) => {
      console.log('idx:', idx, 'item.idx:', item.idx);
      return idx !== item.idx;
    });
    dispatch(updateCurrentLayers(newList));
  };
  const editItem = (idx, value) => {
    const newDataList = currentLayers.map((item) => {
      if (item.idx === idx) {
        item.element = value;
      }
      return item;
    });
    dispatch(updateCurrentLayers(newDataList));

    const newOrganizeData = _.map(organizeData, (item) => {
      if (item.idx == currentAttributeId) {
        item.elements = currentLayers;
      }
      return item;
    });

    dispatch(updateOrganizeData(newOrganizeData));
  };

  return (
    <div className={cs} {...props}>
      {currentLayers.length > 0 &&
        currentLayers.map((item, i) => {
          return <LayerItem key={i} data={item} moveItem={moveItem} deleteItem={deleteItem} editItem={editItem} />;
        })}
      {children}
    </div>
  );
}

LayerList.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  dataList: PropTypes.array.isRequired,
};

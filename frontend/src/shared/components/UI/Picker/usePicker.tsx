import { useState } from 'react';
import css from './ItemPicker.module.css';
import { TiDelete } from 'react-icons/ti';
import { MdDeleteForever } from 'react-icons/md';

interface Item {
  [key: string]: any;
}

const useItemPicker = (items: Array<Item>, field: string, label?: string, hideDeleteAll?: boolean) => {
  const [pickedFields, setPickedFields] = useState<Item[]>([]);
  const [unPickedFields, setUnpickedFields] = useState<Array<Item>>(items)

  const handlePick = (item: Item) => {
    console.log('handlePick, PickedFields:')
    setPickedFields(prev => prev ? [...prev, item] : [item]);
    console.log(pickedFields)
  };

  const clear = () => {
    setPickedFields([])
  }

  // const handleUnpick = (item: Item) => {
  //   console.log('handleUnpick, UnkickedFields:')
  //   setPickedFields(prev => prev.filter((picked) => picked !== item));
  //   console.log(unPickedFields)
  // };

  // const handleUnpick = (item: Item) => {
  //   setPickedFields(prev => prev.filter((picked) => picked !== item));
  //   setUnpickedFields(prev => prev ? [...prev, item] : [item]);
  // };

  const handleUnpick = (item: Item) => {
    setPickedFields(prevPicked => prevPicked.filter(picked => picked !== item));

    setUnpickedFields(prevUnpicked => {
      // Проверяем, чтобы элемент не добавлялся несколько раз
      if (!prevUnpicked.includes(item)) {
        return [...prevUnpicked, item];
      }
      return prevUnpicked;
    });
  };

  const handleUpdate = (algo: Item[]) => {
    setUnpickedFields(algo)
  }

  const Picker = () => (
    <div className={css.wrapper}>
      <div className={css.label}>{label}</div>
      <div className={css.pickList}>
        {unPickedFields && unPickedFields?.filter((item: Item) => !pickedFields?.includes(item)).map((item: Item) => (
          <div key={item[field]} className={css.item} onClick={() => handlePick(item)}>
            {item[field]}
          </div>
        ))}
      </div>
    </div>
  );

  const Picked = ({ caption }: { caption?: string }) => (
    <div className={css.wrapper}>
      {caption}
      <div className={css.pickedList}>
        {pickedFields.length > 0 ? pickedFields.map((item) => (<>
          <div key={item[field]} className={css.item} onClick={() => handleUnpick(item)}>
            <TiDelete style={{ color: 'red' }} /> {item[field]}
          </div>

        </>
        )) : <div>
          <div className={css.label}>Не выбранно</div>
        </div>}

        {(pickedFields.length > 0 && !hideDeleteAll) && <div onClick={() => setPickedFields([])} className={css.item}>
          <MdDeleteForever />
          Удалить всё
        </div>}
      </div>
    </div>
  );

  return { Picker, Picked, pickedFields, setItems: handleUpdate, clear, setUnpickedFields, setPickedFields };
};

export default useItemPicker;
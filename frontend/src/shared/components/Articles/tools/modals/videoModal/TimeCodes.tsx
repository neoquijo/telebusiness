import { FC, useState } from "react";
import Input from "../../../../UI/Input/Input";
import Button from "../../../../UI/Button/Button";
import css from './VideoModal.module.css';
type TimeCode = {
  time: any,
  title: string;
}

export const TimeCodeForm: FC<{ onAddTimeCode: (time: TimeCode) => void }> = ({ onAddTimeCode }) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');

  const handleAdd = () => {
    alert(title)
    onAddTimeCode({ title, time: Number(time) });
    setTitle('');
    setTime('');
  };

  return (
    <>

      {/* <Input value={title} onChange={e => setTitle(e.target.value)} label='Надпись' />
      <Input value={time} onChange={e => setTime(e.target.value)} label='Timestamp' />
      <Button onClick={handleAdd}>Добавить</Button>
 */}
      {/* 
      <label>Добавить таймкоды:</label> */}

      <Input value={title} onChange={e => setTitle(e.target.value)} label='Надпись' />
      <div style={{ alignItems: 'flex-end' }} className={css.row}>
        <Input value={time} onChange={e => setTime(e.target.value)} label='Таймкод (в секундах)' />
        <Button disabled={!title || !time} onClick={handleAdd} style={{ height: '1.8em' }}>Добавить</Button>
      </div>
    </>
  );
};
import { FC, useEffect, useState } from 'react';
import css from './Confirm.module.css';
import Input from '../Input/Input';
import Button from '../Button/Button';

interface IProps {
  cb: () => void
  toDelete: string;
  effects?: string;
  inputConfirm: string;
}

const ConfirmDelete: FC<IProps> = ({ cb, toDelete, effects, inputConfirm }) => {

  const [confirmation, setConfirmation] = useState('')

  useEffect(() => {
    if (confirmation.toLowerCase() == inputConfirm.toLowerCase())
      cb()
  }, [confirmation])

  return (
    <div className={css.wrapper}>
      <div className={css.confirm}>
        <div className={css.title}>
          Вы уверены что желаете безвовзратно удалить:
          <div className={css.value}>
            {toDelete}
          </div>
        </div>
        <div className={css.effects}>
          {effects}
        </div>

        <div className={css.delete}>
          {inputConfirm.length > 0 ?
            <>
              <div className={css.input}>
                <label>Для подтверждения удаения, введите "{inputConfirm}" в красном поле:</label>
                <Input onChange={e => setConfirmation(e.target.value)} style={{ background: 'red', borderRadius: '5px', color: 'white' }} />
              </div>
            </>
            :
            <>
              <Button variant='danger'>Удалить!</Button>
            </>}
        </div>
      </div>
    </div>
  );
};

//TODO Написать стили для подтверждения действия
const ConfirmAction: FC<IProps> = ({ cb, toDelete, effects, inputConfirm }) => {

  const [confirmation, setConfirmation] = useState('')

  useEffect(() => {
    if (confirmation.toLowerCase() == inputConfirm.toLowerCase())
      cb()
  }, [confirmation])

  return (
    <div className={css.wrapper}>
      <div className={css.confirm}>
        <div className={css.title}>
          Вы уверены что желаете безвовзратно удалить:
          <div className={css.value}>
            {toDelete}
          </div>
        </div>
        <div className={css.effects}>
          {effects}
        </div>

        <div className={css.delete}>
          {inputConfirm.length > 0 ?
            <>
              <div className={css.input}>
                <label>Для подтверждения удаения, введите "{inputConfirm}" в красном поле:</label>
                <Input onChange={e => setConfirmation(e.target.value)} style={{ background: 'red', borderRadius: '5px', color: 'white' }} />
              </div>
            </>
            :
            <>
              <Button variant='danger'>Удалить!</Button>
            </>}
        </div>
      </div>
    </div>
  );
};


export { ConfirmDelete, ConfirmAction };

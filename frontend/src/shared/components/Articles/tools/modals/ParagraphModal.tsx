import { FC, useState } from 'react';
import css from './Modal.module.css';
import Button from '../../../UI/Button/Button';
import TextBox from '../../../UI/Textbox/Textbox';
import { infoSuccess, infoWarning } from '../../../../lib/toastWrapper';
import { useAppDispatch } from '../../../../../core/store/MainStore';
import { addToCanvas } from '../../../../../core/store/slices/canvasSlice';

interface IProps {
  close: () => void;
}

const ParagraphModal: FC<IProps> = ({ close }) => {
  const dispatch = useAppDispatch()

  const handleAdd = () => {
    if (text) {
      dispatch(addToCanvas({
        type: 'text',
        text: text
      }))
      infoSuccess('Текст добавлен!')
      close()
    }
    else infoWarning('Заполните поля текст')
  }

  const [text, setText] = useState('')

  return (
    <div className={css.modal}>
      <div className={css.wrapper}>
        <TextBox label='Строчный текст:' onChange={e => setText(e.target.value)} style={{ height: '50vmin' }} />

      </div>




      <div onClick={handleAdd} className={css.actions}>
        <Button>Добавить на холст</Button>
      </div>
    </div>
  );
};

export default ParagraphModal;
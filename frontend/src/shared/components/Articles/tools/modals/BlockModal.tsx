import { FC, useState } from 'react';
import css from './Modal.module.css';
import Button from '../../../UI/Button/Button';
import { FaInfo } from 'react-icons/fa6';
import { MdDangerous } from 'react-icons/md';
import { ImWarning } from 'react-icons/im';
import Input from '../../../UI/Input/Input';
import TextBox from '../../../UI/Textbox/Textbox';
import Information from '../../../UI/Information/Information';
import { CanvasElement } from '../../../../../types/canvasElement';
import { useAppDispatch } from '../../../../../core/store/MainStore';
import { addToCanvas } from '../../../../../core/store/slices/canvasSlice';
import { infoSuccess, infoWarning } from '../../../../lib/toastWrapper';


interface IProps {
  close: () => void;
}

const BlockModal: FC<IProps> = ({ close }) => {

  const [variant, setVariant] = useState<'danger' | 'warning' | 'info'>('danger')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const dispatch = useAppDispatch()

  const handleAdd = () => {
    if (!title || !variant || !content)
      infoWarning('Заполните все поля для продолжения')
    else {

      const data: CanvasElement<'info'> = {
        type: 'info',
        variant: variant,
        title,
        content
      }
      infoSuccess('Информационный блок добавлен!')
      dispatch(addToCanvas(data))
      close()
    }
  }

  const renderElement = () => {
    return <>
      <Information title={title} content={content} variant={variant} />
    </>
  }

  return (
    <div className={css.modal}>
      <div className={css.wrapper}>
        <div style={{ justifyContent: 'space-between' }} className={css.row}>
          <div className={css.label}>Вариант блока:</div>
          <div className={css.row}>
            <div className={css.variants}>
              <div onClick={() => setVariant('info')} className={`${css.variant} ${variant == 'info' ? css.activeVariant : ''}`}>
                <FaInfo className={css.icon} />
              </div>
              <div onClick={() => setVariant('warning')} className={`${css.variant} ${variant == 'warning' ? css.activeVariant : ''}`}>
                <ImWarning className={css.icon} style={{ color: 'yellow' }} />
              </div>
              <div onClick={() => setVariant('danger')} className={`${css.variant} ${variant == 'danger' ? css.activeVariant : ''}`}>
                <MdDangerous className={css.icon} style={{ color: 'salmon' }} />
              </div>
            </div>
          </div>
        </div>
        <div style={{ gap: '1em' }} className={css.col}>
          <Input required onChange={e => setTitle(e.target.value)} label={'Заголовок'} />
          <TextBox required onChange={e => setContent(e.target.value)} label='Содержание' />
        </div>

      </div>


      <div className={css.previewSection}>
        <div className={css.row}>
          <div className={css.label}>
            Предворительный просмотр:
          </div>
        </div>

        <div className={css.preview}>
          {renderElement()}
        </div>
      </div>

      <div className={css.actions}>
        <Button onClick={handleAdd} >Добавить на холст</Button>
      </div>
    </div>
  );
};

export default BlockModal;
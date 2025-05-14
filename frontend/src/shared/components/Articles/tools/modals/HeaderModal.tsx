import { FC, useState } from 'react';
import css from './Modal.module.css';
import { BsTypeH1, BsTypeH2, BsTypeH3, BsTypeH4 } from 'react-icons/bs';
import Input from '../../../UI/Input/Input';
import Button from '../../../UI/Button/Button';
import { infoSuccess, infoWarning } from '../../../../lib/toastWrapper';
import { useAppDispatch } from '../../../../../core/store/MainStore';
import { addToCanvas } from '../../../../../core/store/slices/canvasSlice';

interface IProps {
  close: () => void;
}

const HeaderModal: FC<IProps> = ({ close }) => {

  const [variant, setVariant] = useState<'h1' | 'h2' | 'h3' | 'h4'>('h4')
  const [text, setText] = useState('')
  const dispatch = useAppDispatch()

  const renderText = () => {
    switch (variant) {
      case 'h1':
        return <h1>{text}</h1>
      case 'h2':
        return <h2>{text}</h2>
      case 'h3':
        return <h3>{text}</h3>
      case 'h4':
        return <h4>{text}</h4>
    }
  }

  const handleAdd = () => {
    if (text) {
      infoSuccess('Заголовок добавлен!')
      dispatch(addToCanvas({
        type: 'header',
        variant,
        text
      }))
      close()
    }
    else infoWarning('Введите текст заголовка!')
  }

  return (
    <div className={css.modal}>
      <div className={css.wrapper}>
        <div className={css.headerModal}>

          <div style={{ justifyContent: 'space-between' }} className={css.row}>
            <div className={css.label}>
              Вариант заголовка:
            </div>

            <div className={css.variants}>
              <div onClick={() => setVariant('h1')} className={`${css.variant} ${variant == 'h1' ? css.activeVariant : ''}`}>
                <BsTypeH1 className={css.icon} />

              </div>

              <div onClick={() => setVariant('h2')} className={`${css.variant} ${variant == 'h2' ? css.activeVariant : ''}`}>
                <BsTypeH2 className={css.icon} />
              </div>

              <div onClick={() => setVariant('h3')} className={`${css.variant} ${variant == 'h3' ? css.activeVariant : ''}`}>
                <BsTypeH3 className={css.icon} />
              </div>

              <div onClick={() => setVariant('h4')} className={`${css.variant} ${variant == 'h4' ? css.activeVariant : ''}`}>
                <BsTypeH4 className={css.icon} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1em' }} className={css.col}>
            <Input onChange={e => setText(e.target.value)} value={text} label='Текст заголовка:' />
          </div>
        </div>
      </div>

      <div className={css.previewSection}>
        <div className={css.row}>
          <div className={css.label}>
            Предворительный просмотр:
          </div>
        </div>

        <div className={css.preview}>
          {renderText()}
        </div>
      </div>

      <div onClick={handleAdd} className={css.actions}>
        <Button icon={BsTypeH1}>Добавить заголовок на холст</Button>
      </div>
    </div>
  );
};

export default HeaderModal;
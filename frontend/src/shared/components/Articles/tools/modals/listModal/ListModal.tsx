import { FC, useState } from 'react';
import css from './ListModal.module.css';
import Button from '../../../../UI/Button/Button';
import Radio from '../../../../UI/Radio/Radio';
import Input from '../../../../UI/Input/Input';
import Checkbox from '../../../../UI/Checkbox/Checkbox';
import { LiaDotCircle } from 'react-icons/lia';
import { useAppDispatch } from '../../../../../../core/store/MainStore';
import { addToCanvas } from '../../../../../../core/store/slices/canvasSlice';
import { CanvasElement } from '../../../../../../types/canvasElement';

interface IProps {
  close: () => void;
}

const ListModal: FC<IProps> = ({ close }) => {

  const [items, setItems] = useState<Array<string>>([])
  const [variant, setVariant] = useState('ul')
  const [hasTitle, setHasTitle] = useState(false)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const dispatch = useAppDispatch()

  const handleAdd = () => {
    if (items.length > 0) {
      const data: CanvasElement<'list'> = {
        type: 'list',
        title,
        variant,
        items
      }
      dispatch(addToCanvas(data))
    }
    close()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && text.trim() !== '') {
      setItems(prev => [...prev, text])
      setText('')
    }
  }

  const renderElement = () => {
    return <>
      <div className={css.listTitle}>
        {title}
      </div>

      <div className={css.elements}>
        {items.map((el, index) => {
          return <div className={css.element} key={index}>
            <div className={css.index}>
              {variant == 'ol' ? index + 1 + '.' : <LiaDotCircle className={css.icon} />}
            </div>
            <div className={css.value}>
              {el}
            </div>
          </div>
        })}
      </div>
    </>
  }

  return (
    <div className={css.modal}>
      <div className={css.wrapper}>

        <div className={css.row}>
          <Radio
            label="Не нумерованный"
            checked={variant === "ul"}
            onChange={() => setVariant("ul")}
            id="male"
            name="variant"
            inline
          />
          <Radio
            label="Нумерованный"
            checked={variant === "ol"}
            onChange={() => setVariant("ol")}
            id="female"
            name="variant"
            inline
          />
          <Checkbox inline label='С заголовком' checked={hasTitle} onChange={() => setHasTitle(!hasTitle)} />
          <Input onChange={e => setTitle(e.target.value)} className={hasTitle ? css.inputTitle : css.hidden} label='Заголовок списка' />
        </div>

        <div style={{ marginTop: '1em', alignItems: 'flex-end' }} className={css.row}>
          <Input
            onChange={e => setText(e.target.value)}
            value={text}
            label='Элемент списка'
            onKeyDown={handleKeyDown}
          />
          <Button variant='ghost' onClick={() => {
            if (text.trim() !== '') {
              setItems(prev => [...prev, text])
              setText('')
            }
          }} >Добавить</Button>
        </div>

      </div>

      <div className={css.previewSection}>
        <div className={css.row}>
          <div className={css.label}>
            Предварительный просмотр:
          </div>
        </div>

        <div className={css.preview}>
          {renderElement()}
        </div>
      </div>

      <div onClick={handleAdd} className={css.actions}>
        <Button>Добавить на холст</Button>
      </div>
    </div>
  );
};

export default ListModal;
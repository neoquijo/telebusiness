import { FC, useState } from 'react';
import css from './ImageModal.module.css';
import 'react-medium-image-zoom/dist/styles.css';
import { useAppDispatch, useAppSelector } from '../../../../../../core/store/MainStore';
import SingleUpload from '../../../../UI/upload/singleUpload/SingleUpload';
import Gallery from '../../../../Gallery/ImageGallery';
import { API_URL } from '../../../../../../config';
import Input from '../../../../UI/Input/Input';
import Select from '../../../../UI/Select/Select';
import Button from '../../../../UI/Button/Button';
import { MdDelete } from 'react-icons/md';
import { FcAddImage } from 'react-icons/fc';
import { useModalManager } from '../../../../../../core/providers/modal/ModalProvider';
import { addToCanvas } from '../../../../../../core/store/slices/canvasSlice';
import { infoSuccess } from '../../../../../lib/toastWrapper';

interface IProps {
  close: () => void;
}

const ImageModal: FC<IProps> = ({ close }) => {

  const { uploadSource } = useAppSelector(s => s.canvas)

  const [image, setImage] = useState('')
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(180);
  const [widthIn, setWidthIn] = useState<'pixels' | 'percent'>('pixels');
  const dispatch = useAppDispatch()

  const handleAdd = () => {
    dispatch(addToCanvas({
      type: 'image',
      height,
      widthIn: widthIn,
      width,
      content: image
    }))
    infoSuccess('Изображение добавлено!')
    close()
  }


  return !image ? uploadSource == 'form' ? <SingleUpload /> : <Gallery cb={e => setImage(e)} /> :

    <div className={css.wrapper}>
      <div className={css.preview}>
        <img
          height={height}
          style={{ objectFit: 'cover', maxWidth: widthIn === 'pixels' ? `${width}px` : `${width}%`, maxHeight: '200vh' }}
          alt='preview'
          className={css.image} src={`${API_URL}/i/${image}`} />
      </div>

      <div className={css.options}>
        <div className={css.col}>
          <Input value={height} max={1000} type='number' onChange={e => setHeight(Number(e.target.value))} label='Высота в пикселях' />
          <Select value={widthIn} onChange={(e) => {
            if (e.target.value == 'percent')
              setWidthIn('percent')
            else setWidthIn('pixels')
          }} label='Максимальная ширина' options={[
            { value: 'percent', label: 'В процентах' },
            { value: 'pixels', label: 'В пикселях' }
          ]} />
          <Input type='number' min={100} max={widthIn === 'pixels' ? 1000 : 100} value={width} onChange={(e) => setWidth(Number(e.target.value))} label='Значение' />

          <Button onClick={handleAdd} variant='ghost' style={{ marginTop: '2em', width: '100%' }}><FcAddImage /> Добавить на холст</Button>
          <Button style={{ width: '100%' }} onClick={() => setImage('')} variant='ghost'> <MdDelete style={{ color: 'salmon' }} />Выбрать другое изображение</Button>
        </div>
      </div>
    </div>

};

export default ImageModal;

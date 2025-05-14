import { FC, useEffect, useState } from 'react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import css from './SingleUpload.module.css';
import Input from '../../Input/Input';
import { useUpload } from '../useUpload';
import Select from '../../Select/Select';
import Button from '../../Button/Button';
import { MdDelete } from 'react-icons/md';
import { FcUpload } from 'react-icons/fc';
import { useAppDispatch } from '../../../../../core/store/MainStore';
import { useUploadImageMutation } from '../../../../../API/uploadApi';
import { addToCanvas } from '../../../../../core/store/slices/canvasSlice';
import { useModalManager } from '../../../../../core/providers/modal/ModalProvider';
import { FiRefreshCcw } from 'react-icons/fi';

interface IProps { }

const SingleUpload: FC<IProps> = () => {

  const { uploadedFiles, Uploader, raw, clearImages } = useUpload({ caption: 'Загрузить новую', imageOnly: true });
  const dispatch = useAppDispatch()
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(180);
  const [widthIn, setWidthIn] = useState<'pixels' | 'percent'>('pixels');
  const [source, setSource] = useState('');
  const modal = useModalManager()
  const [localFile, setLocalFile] = useState<File>()
  const [imageLoading, setImageLoading] = useState('')

  const [upload, { isSuccess, data }] = useUploadImageMutation()

  const handleDelete = () => {

    clearImages();
    setSource('');
  };


  useEffect(() => {
    setLocalFile(uploadedFiles[0])
  }, [uploadedFiles.length])

  const handleUpload = async () => {

    if (!source && !localFile) return;
    setImageLoading('Обрабатываем изображение...');

    try {
      let fileToUpload: File;

      if (source) {
        const response = await fetch(source);
        const blob = await response.blob();
        fileToUpload = new File([blob], 'upload.jpg', { type: blob.type });
      } else if (localFile) {
        fileToUpload = localFile;
      } else {
        return;
      }

      const formData = new FormData();
      formData.append('image', fileToUpload);
      await upload(formData);
      setImageLoading('');
    } catch (error) {
      setImageLoading('Ошибка загрузки');
      console.error('Ошибка загрузки:', error);
    }
  };


  useEffect(() => {
    if (isSuccess) {
      dispatch(addToCanvas({
        type: 'image',
        height,
        widthIn: widthIn,
        width,
        content: data[0].filename
      }))
      modal.closeAllModals()
    }
  },
    [isSuccess])


  const createImage = (
    url: string
  ) => {
    setSource('')
    setImageLoading('Получаем изображение')
    const image = new Image()
    setTimeout(() => {
      image.src = url
      image.onload = () => {
        setImageLoading('')
        setSource(url)
      }
      image.onerror = (e) => {
        setImageLoading('Не удалось получить изображение')
        console.log(e)
      }
    }, 1000)


  }

  useEffect(() => {
    if (widthIn === 'pixels') {
      if (width > 2000) setWidth(1000);
    } else {
      if (width > 100) setWidth(100);
    }
  }, [widthIn, width]);

  return (
    <div className={css.modal}>
      <div className={css.wrapper}>
        <div style={{ alignItems: 'flex-end' }} className={css.row}>

          <Input onChange={e => createImage(e.target.value)} label='URL картинки:' />
          <FiRefreshCcw />
        </div>
        {imageLoading}
        <div style={{ gap: '1em', marginTop: '2em' }} className={css.row}>
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
        </div>
        {!source && raw.length < 1 ? <Uploader /> : ''}
      </div>

      {(source || raw.length > 0) && (
        <div className={css.previewSection}>
          <div style={{ justifyContent: 'space-between' }} className={css.row}>
            <div className={css.label}>Предварительный просмотр:</div>
            <div className={css.delete}>

            </div>
          </div>
          <div className={css.preview}>
            {(source ? [source] : raw).map((el, index) => (
              <div key={index} className={css.imageContainer}>
                <Zoom zoomMargin={30}>
                  <img
                    height={height}

                    src={el}
                    style={{ objectFit: 'cover', maxWidth: widthIn === 'pixels' ? `${width}px` : `${width}%`, maxHeight: '200vh' }}
                    alt='preview'
                  />
                </Zoom>
              </div>
            ))}
          </div>
        </div>
      )}
      {(source.length > 0 || uploadedFiles.length > 0) &&
        <div style={{ gap: '1em' }} className={css.row}>
          <Button onClick={handleUpload} icon={FcUpload}>Загрузить и добавить на холст</Button>
          <Button onClick={handleDelete} variant='danger' icon={MdDelete}>Удалить</Button>
        </div>
      }
    </div>
  );
};

export default SingleUpload;

import { FC, useEffect, useState, useCallback } from 'react';
import css from './ImageGallery.module.css';
import { useDeleteFromGalleryMutation, useGetAllGalleriesQuery, useGetGalleryFilesQuery, useUploadImageToGalleryMutation } from '../../../API/galleriesApi';
import Select from '../UI/Select/Select';
import NoData from '../NoData/NoData';
import { useUpload } from '../UI/upload/useUpload';
import Button from '../UI/Button/Button';
import { FcCameraAddon } from 'react-icons/fc';
import Loading from '../UI/Loading/Loading';
import { IoIosSave } from 'react-icons/io';
import { MdDelete } from 'react-icons/md';
import { API_URL } from '../../../config';
import ImageZoom from 'react-medium-image-zoom';
import { TbHandClick } from 'react-icons/tb';
import { useModalManager } from '../../../core/providers/modal/ModalProvider';
import { ConfirmDelete } from '../UI/Alert/Confirm';
import { infoSuccess } from '../../lib/toastWrapper';

interface GalleryProps {
  cb: (item: string) => any;
}

const Gallery: FC<GalleryProps> = ({ cb }) => {
  const [selectedGallery, setSelectedGallery] = useState<string>('default');
  const [files, setFiles] = useState<any[]>([]);
  const [_, setShowCreateGallery] = useState<boolean>(false);

  const { data: galleriesData, isLoading: isLoadingGalleries } = useGetAllGalleriesQuery('');
  const { data: galleryFiles, isFetching: isFetchingFiles, refetch } = useGetGalleryFilesQuery(selectedGallery);
  const [uploadImages, { isSuccess: uploadSuccess }] = useUploadImageToGalleryMutation()

  const { Uploader, UploadPreview, uploadedFiles, clearImages } = useUpload({ caption: 'Загрузить изображения', multiple: true });
  const modal = useModalManager()

  const [deleteFromGallery, { isSuccess: deleted }] = useDeleteFromGalleryMutation()

  useEffect(() => {
    if (deleted) {
      modal.closeModal('confirmDelete')
      infoSuccess('Файл удалён')
    }
  }, [deleted])

  useEffect(() => {
    if (uploadSuccess) {
      console.log('Upload successful!');
      refetch()
      clearImages()
    }
  }, [uploadSuccess]);

  useEffect(() => {
    if (galleryFiles) {
      setFiles(galleryFiles);
    }
  }, [galleryFiles]);

  const handleUpload = useCallback(() => {
    if (!uploadedFiles.length) return;

    const formData = new FormData();
    formData.append('filesType', 'image');
    formData.append('galleryId', selectedGallery);
    uploadedFiles.forEach(file => formData.append('image', file));

    uploadImages(formData);
  }, [uploadedFiles, selectedGallery, uploadImages]);

  return (
    <div className={css.wrapper}>
      {(isLoadingGalleries || isFetchingFiles) && <Loading />}

      <div className={css.row}>
        <div className={css.imagesSection}>
          {files.length > 0 ? (
            <div className={css.images}>{files.map(el => {
              return <div className={css.imageWrapper}>
                <ImageZoom zoomMargin={50}>
                  <div className={css.pick}>
                    <img className={css.image} src={API_URL + `/i/${el.filename}`} />
                    <div className={css.pickButtons}>
                      <Button onClick={() => cb(el.filename)} value={el.filename} variant='ghost' className={css.button} icon={TbHandClick}>Выбрать</Button>
                      <Button onClick={() => modal.openModal('confirmDelete', <ConfirmDelete cb={function (): void {
                        deleteFromGallery({ galleryId: selectedGallery, filename: el.filename }).then(res => {
                          if (!res.error) {
                            modal.closeModal('confirmDelete')
                            infoSuccess(`Файл ${el.filename} удален из галереи!`)
                          }
                        })

                      }}
                        toDelete={'Изображение ' + el.filename}
                        effects={`Изображение будет безвозвратно удалено из галереи
                `}
                        inputConfirm={'удалить'} />, {})}
                        variant='ghost' ><MdDelete style={{ color: 'salmon' }} />Удалить</Button>
                    </div>
                  </div>
                </ImageZoom>

              </div>
            })}</div>
          ) : (
            <NoData text={'Сюда еще ничего не загрузили!'} subText={'Галерея пуста'} />
          )}
        </div>

        <div className={css.galleriesSection}>
          <div className={css.buttons}>
            <Button onClick={() => setShowCreateGallery(true)} icon={FcCameraAddon} style={{ width: '100%' }}>
              Создать новую галерею
            </Button>
            {/* <Button onClick={refetch}>Обновить</Button> */}
          </div>

          <div className={css.top}>
            <Select
              value={selectedGallery}
              onChange={e => setSelectedGallery(e.target.value)}
              label='Выбор галереи'
              options={galleriesData?.items?.map(el => ({
                label: `${el.title} [${el.filesType === 'file' ? 'Файлы' : 'Изображения'}]`,
                value: el.id,
              })) || []}
            />
          </div>

          <div className={css.uploader}>
            {uploadedFiles.length < 1 ? (
              <Uploader />
            ) : (
              <div className={css.summary}>
                <p>Загружено {uploadedFiles.length} файл(ов)</p>
                <Button onClick={handleUpload} className={css.button} icon={IoIosSave}>
                  Сохранить в галерее
                </Button>
                <Button onClick={clearImages} className={css.button} icon={MdDelete} variant='danger'>
                  Удалить загруженные файлы
                </Button>
              </div>
            )}
          </div>
        </div>
      </div >

      <div className={css.preview}>
        <UploadPreview />
      </div>
    </div >
  );
};

export default Gallery;

import { useState } from 'react';
import css from './useUpload.module.css';
import { FaCamera, } from 'react-icons/fa6';
import { MdDeleteForever } from 'react-icons/md';
import { FaFileAlt, FaFileArchive } from 'react-icons/fa';

interface UseUploadProps {
  caption?: string;
  uploadMore?: string;
  multiple?: boolean;
  imageOnly?: boolean;
}

export const useUpload = ({ caption = 'Загрузка изображений', multiple, uploadMore = 'Загрузить еще', imageOnly }: UseUploadProps) => {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [uploadedFiles, setImageFiles] = useState<File[]>([]);

  const clearImages = () => {
    setPreviewImages([])
    setImageFiles([])
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const previews = files.map((file) => URL.createObjectURL(file));
      setPreviewImages(previews);
      setImageFiles(files);
    }
  };

  const addImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const previews = files.map((file) => URL.createObjectURL(file));
      setPreviewImages((prev) => [...prev, ...previews]);
      setImageFiles((prev) => [...prev, ...files]);
    }
  };

  const handleImageRemove = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const Uploader = () => (
    <label htmlFor="imageUpload" className={css.uploadLabel}>
      <div className={css.uploadSection}>
        <div className={css.upload}>
          <FaCamera className={css.bigIcon} />
          {caption}
        </div>

        <input
          id="imageUpload"
          type="file"
          multiple={multiple}
          accept={imageOnly ? "image/*" : '*'}
          onChange={handleImageUpload}
          className={css.hiddenInput}
        />
      </div>
    </label>
  );

  const UploadPreview = () => (
    <>
      {previewImages.length > 0 && (
        <div className={css.imagePreviewContainer}>
          {previewImages.map((src, index) => {
            const file = uploadedFiles[index];
            const isImage = file.type.startsWith('image/');

            return (
              <div
                key={index}
                className={css.imagePreview}
                onClick={() => handleImageRemove(index)}
              >
                <div className={css.remove}>
                  <MdDeleteForever />
                </div>
                {isImage ? (
                  <img
                    src={src}
                    alt={`preview-${index}`}
                    className={css.previewImage}
                  />
                ) : (
                  <div className={css.filePreview}>
                    {file.type.includes('zip') || file.type.includes('rar') ? (
                      <FaFileArchive className={css.fileIcon} />
                    ) : (
                      <FaFileAlt className={css.fileIcon} />
                    )}
                    <div className={css.fileInfo}>
                      <span className={css.fileName}>{file.name}</span>
                      <span className={css.fileSize}>{(file.size / 1024).toFixed(2)} KB</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {multiple && (
            <label htmlFor="addImages" className={css.uploadLabel}>
              <div
                style={{ marginLeft: '1em' }}
                className={`${css.imagePreview} ${css.addImages}`}
              >
                <FaCamera className={css.bigIcon} />
                {uploadMore}
                <input
                  id="addImages"
                  type="file"
                  multiple
                  accept={imageOnly ? "image/*" : '*'}
                  onChange={addImages}
                  className={css.hiddenInput}
                />
              </div>
            </label>
          )}
        </div>
      )}
    </>
  );

  return { Uploader, UploadPreview, uploadedFiles, raw: previewImages, clearImages };
};
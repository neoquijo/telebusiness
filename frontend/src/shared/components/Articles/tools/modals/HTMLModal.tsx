import { FC } from 'react';
import css from './Modal.module.css';
import Button from '../../../UI/Button/Button';

interface IProps {
  close: () => void;
}

const HTMLModal: FC<IProps> = ({ close }) => {

  const handleAdd = () => {
    close()
  }

  const renderElement = () => {
    return <></>
  }

  return (
    <div className={css.modal}>
      <div className={css.wrapper}>


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

      <div onClick={handleAdd} className={css.actions}>
        <Button>Добавить на холст</Button>
      </div>
    </div>
  );
};

export default HTMLModal;
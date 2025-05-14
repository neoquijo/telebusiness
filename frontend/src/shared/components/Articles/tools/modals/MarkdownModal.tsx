import { FC, useState } from 'react';
import css from './Modal.module.css';
import Button from '../../../UI/Button/Button';
import TextBox from '../../../UI/Textbox/Textbox';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Input from '../../../UI/Input/Input';
import { useAppDispatch } from '../../../../../core/store/MainStore';
import { addToCanvas } from '../../../../../core/store/slices/canvasSlice';
import { infoSuccess, infoWarning } from '../../../../lib/toastWrapper';
import Information from '../../../UI/Information/Information';

interface IProps {
  close: () => void;
}

const MarkdownModal: FC<IProps> = ({ close }) => {
  const [markdown, setMarkdown] = useState('')
  const dispatch = useAppDispatch()
  const [title, setTitle] = useState('')

  const handleAdd = () => {
    if (markdown) {
      dispatch(addToCanvas({
        type: 'markdown',
        title,
        content: markdown
      }))
      infoSuccess('MD разметка добавленна на холст!')
      close()
    }
    else {
      infoWarning('Отсутствует разметка!')
    }
  }

  const renderElement = () => {
    return <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
    >
      {markdown}
    </ReactMarkdown>
  }


  return (
    <div className={css.modal}>
      <div style={{ gap: '1em' }} className={css.row}>
        <div style={{ width: '100%', minWidth: '70vw' }} className={css.wrapper}>
          <div style={{ gap: '1em' }} className={css.col}>
            <Input onChange={(e) => setTitle(e.target.value)} label='Описание' info='Для отображения на холсте' />
            <TextBox info='Markdown (MD) — это простой язык разметки для форматирования текста. Легко читается и преобразуется в HTML. Популярен для написания документации, README-файлов и постов.' required style={{ height: '18vmin' }} onChange={e => setMarkdown(e.target.value)} label='MD разметка:' />
          </div>

        </div>
        <div style={{ maxWidth: '300px' }} className={css.info}>
          <Information title='Markdown' content={'Markdown (MD) — это простой язык разметки для форматирования текста. Использует символы (#, *, -, `, []() и др.) для создания заголовков, списков, ссылок, кода и т.д. Легко читается и преобразуется в HTML. Популярен для написания документации, README-файлов и постов.'} />
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

      <div onClick={handleAdd} className={css.actions}>
        <Button>Добавить на холст</Button>
      </div>
    </div>
  );
};

export default MarkdownModal;
// src/modules/FiltersModule/modals/TestFilterModal.tsx
import { FC, useState } from 'react';
import css from './TestFilterModal.module.css';
import Button from '../../../shared/components/UI/Button/Button';
import Checkbox from '../../../shared/components/UI/Checkbox/Checkbox';
import { FaPlay, FaCheck, FaTimes } from 'react-icons/fa';
import { useTestFilterMutation } from '../../../API/filtersApi';
import { infoError } from '../../../shared/lib/toastWrapper';
import TextBox from '../../../shared/components/UI/Textbox/Textbox';

interface IProps {
  filterId: string;
  filterName: string;
  hasMediaOption?: boolean;
}

const TestFilterModal: FC<IProps> = ({ filterId, filterName, hasMediaOption = false }) => {
  const [testMessage, setTestMessage] = useState('');
  const [hasMedia, setHasMedia] = useState(false);
  const [testFilter, { isLoading, data: testResult }] = useTestFilterMutation();

  const handleTest = async () => {
    if (!testMessage.trim()) {
      infoError('Введите текст сообщения для тестирования');
      return;
    }

    try {
      await testFilter({
        id: filterId,
        testData: {
          messageText: testMessage,
          hasMedia: hasMediaOption ? hasMedia : undefined
        }
      }).unwrap();
    } catch (error) {
      infoError('Ошибка при тестировании фильтра');
      console.error('Test filter error:', error);
    }
  };

  return (
    <div className={css.wrapper}>
      <div className={css.content}>
        <div className={css.description}>
          <p>Введите текст сообщения для проверки соответствия фильтру <strong>"{filterName}"</strong></p>
        </div>

        <TextBox
          label="Текст сообщения"
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Введите текст сообщения для тестирования..."
          rows={6}
        />

        {hasMediaOption && (
          <div className={css.mediaOption}>
            <Checkbox
              label="Сообщение содержит медиафайлы (изображения, видео, документы и т.д.)"
              checked={hasMedia}
              onChange={() => setHasMedia(!hasMedia)}
            />
          </div>
        )}

        {testResult && (
          <div className={css.result}>
            <div className={css.resultHeader}>
              <div className={`${css.resultIcon} ${testResult.matches ? css.success : css.failure}`}>
                {testResult.matches ? <FaCheck /> : <FaTimes />}
              </div>
              <div className={css.resultText}>
                <div className={css.resultTitle}>
                  {testResult.matches ? 'Сообщение соответствует фильтру' : 'Сообщение не соответствует фильтру'}
                </div>
                <div className={css.resultSubtitle}>
                  Фильтр: {testResult.filterName}
                </div>
              </div>
            </div>

            <div className={css.testedMessage}>
              <strong>Протестированное сообщение:</strong>
              <p>{testResult.messageText}</p>
              {hasMediaOption && (
                <div className={css.testedMedia}>
                  <strong>Наличие медиа:</strong> {testResult.hasMedia ? 'Да' : 'Нет'}
                </div>
              )}
            </div>
          </div>
        )}

        <div className={css.actions}>
          <Button
            icon={FaPlay}
            onClick={handleTest}
            disabled={isLoading || !testMessage.trim()}
          >
            {isLoading ? 'Тестирование...' : 'Протестировать'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestFilterModal;
import { FC, useEffect, useState } from 'react';
import css from './VideoModal.module.css';
import Button from '../../../../UI/Button/Button';
import Input from '../../../../UI/Input/Input';
import { FaDeleteLeft, FaPaste } from 'react-icons/fa6';
import { useYouTubePlayer } from '../../views/Youtube/useYoutubePlayer';
import NoData from '../../../../NoData/NoData';
import { TimeCodeForm } from './TimeCodes';
import { MdDelete, MdDoNotDisturb } from 'react-icons/md';
import { CanvasElement, TimeCode } from '../../../../../../types/canvasElement';
import { FaCheckCircle } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { addToCanvas } from '../../../../../../core/store/slices/canvasSlice';
import { infoSuccess } from '../../../../../lib/toastWrapper';

interface IProps {
  close: () => void;
}

const VideoModal: FC<IProps> = ({ close }) => {
  const dispatch = useDispatch()

  const deleteTimeCode = (index: number) => {
    const newTimeCodes = timeCodes.filter((_, i) => i !== index);
    setTimeCodes(newTimeCodes);
    sendTimeCodes(newTimeCodes);
  };

  const formatTimeCode = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleAdd = () => {
    const data: CanvasElement<'video'> = {
      type: 'video',
      timeCodes,
      content: url,
      width: String(width),
      height: String(height),
      source: 'youtube',
      videoId: videoId!
    }
    dispatch(addToCanvas(data))
    infoSuccess('Видео добавленно')
    close();
  };

  const [timeCodes, setTimeCodes] = useState<Array<TimeCode>>([]);
  const [url, setUrl] = useState('');
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(500);
  const { TimeCodes, setTimeCodes: sendTimeCodes, Player, play, validVideo, videoTitle, videoId } = useYouTubePlayer(url);

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setUrl(clipboardText);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  useEffect(() => {
    sendTimeCodes(timeCodes);
  }, [timeCodes, sendTimeCodes]);

  const addTimeCode = (timecode: TimeCode) => {
    const newTimeCodes = [...timeCodes, { time: timecode.time, title: timecode.title }];
    setTimeCodes(newTimeCodes);
    sendTimeCodes(newTimeCodes);
  };

  return (
    <div className={css.modal}>
      <div className={css.linkSection}>
        <div style={{ alignItems: validVideo ? 'center' : 'end', gap: '1em' }} className={css.row}>
          {validVideo ? <div className={css.valid}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              Видео принято <FaCheckCircle style={{ color: 'greenyellow', fontSize: '1.72em' }} />
            </span>

            <div className={css.videoTitle}>{videoTitle}</div>
            <Button onClick={() => setUrl('')} style={{ marginRight: '1em' }} variant='ghost'>
              <FaDeleteLeft style={{ color: 'yellow' }} />
              Выбрать другое видео
            </Button>
          </div> : <Input value={url} onChange={(e) => setUrl(e.target.value)} label={'Ссылка на видео:'} />}
          <Input onChange={(e) => setWidth(Number(e.target.value))} className={css.size} label="Ширина %" />
          <Input onChange={(e) => setHeight(Number(e.target.value))} className={css.size} label="Высота px" />
          <Button onClick={handlePaste} variant="ghost">
            <FaPaste />
          </Button>
        </div>
      </div>

      <div style={{ gap: '1em' }} className={css.row}>
        <div style={{ width: '50vw' }} className={css.previewSection}>
          <div className={css.row}>
            <div className={css.label}>Предворительный просмотр:</div>
          </div>

          <div className={css.preview}>
            {validVideo ? (
              <Player width={String(width)} height={String(height)} />
            ) : (
              <span style={{ padding: '2rem' }}>

                <NoData
                  text={url ? 'Видео не найдено' : 'Ожидаем видео'}
                  subText={
                    url
                      ? 'При попытке загрузить видео по вашей ссылке произошла ошибка'
                      : 'Введите URL видео в поле "ссылка на видео"'
                  }
                />
              </span>
            )}
            {timeCodes.length > 0 && (
              <div className={css.timeCodes}>
                <label>Быстрый переход:</label>
                <TimeCodes />
              </div>
            )}
          </div>
        </div>

        <div className={css.videoConfig}>
          <label>Добавить таймкоды:</label>
          <TimeCodeForm onAddTimeCode={addTimeCode} />
          <div className={css.col}>
            <div className={css.timeCodes}>
              {timeCodes.map(({ time, title }, index) => (
                <div key={index} className={css.timeCode}>
                  <div onClick={() => play(time)} className={css.time}>
                    [{formatTimeCode(time)}s]
                  </div>
                  -
                  <div className={css.title}>{title}</div>
                  <MdDelete onClick={() => deleteTimeCode(index)} className={css.delete} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {validVideo ? <div onClick={handleAdd} className={css.actions}>
        <Button>Добавить на холст</Button>
      </div> :
        <div className={css.actions}>
          <Button variant='ghost'><MdDoNotDisturb style={{ fontSize: '2em', color: 'red' }} /> Ожидаем видео</Button>
        </div>
      }
    </div>
  );
};

export default VideoModal;
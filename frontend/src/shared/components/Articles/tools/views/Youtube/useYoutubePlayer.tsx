import { useState, useRef, useEffect, FC, HTMLAttributes } from 'react';
import css from './Youtube.module.css'
import { TimeCode } from '../../../../../../types/canvasElement';

export const useYouTubePlayer = (url: string, startTime: number = 0, initialTimeCodes?: TimeCode[]) => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<number>(startTime);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [timeCodes, setTimeCodes] = useState<TimeCode[]>(initialTimeCodes || []);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [title, setTitle] = useState('')

  const formatTimeCode = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;


    return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const { id, time } = extractVideoIdAndTime(url);
    setVideoId(id);
    setTimestamp(startTime || time);
  }, [url, startTime]);

  useEffect(() => {
    if (videoId) {
      isValidYouTubeVideo(videoId).then((res: Response) => {

        res.json().then(data => {
          console.log(title)
          setTitle(data.title)
        })
        setIsValid(true)
      }

      );
    } else {
      setIsValid(false);
    }
  }, [videoId]);

  const play = (time: number) => {
    if (iframeRef.current) {
      iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?start=${time}&autoplay=1`;
    }
  };

  interface IProps extends HTMLAttributes<HTMLDivElement> {
    width: string;
    height: string;
  }

  const Player: FC<IProps> = ({ width = 560, height = 315, ...props }) => (
    <div style={{ height: height + 'px' }}>
      {isValid ? (
        <iframe
          {...props}
          ref={iframeRef}
          width={width + '%'}
          height={height}
          src={`https://www.youtube.com/embed/${videoId}?start=${timestamp}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video player"
        ></iframe>
      ) : (
        <p>Загрузка...</p>
      )}
    </div>
  );


  const TimeCodes: FC = ({ }) => (
    <div className={css.timeCodes}>
      {[...timeCodes]?.sort((a, b) => Number(a.time) - Number(b.time)).map(({ time, title }, index) => (

        <div key={index} className={css.timeCode}>
          <div onClick={() => play(time)} className={css.time}>
            [{formatTimeCode(time)}s]
          </div>
          -
          <div className={css.title}>
            {title}
          </div>
        </div>
      ))}
    </div>
  );

  return { Player, TimeCodes, play, setTimeCodes, validVideo: isValid, videoTitle: title, videoId };
};

const extractVideoIdAndTime = (url: string) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  const timeMatch = url.match(/[?&](?:t|start)=(\d+)/);
  return {
    id: match ? match[1] : '',
    time: timeMatch ? parseInt(timeMatch[1], 10) : 0
  };
};

const isValidYouTubeVideo = async (videoId: string): Promise<Response> => {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    return response
  } catch {
    throw new Error('video link invalid');
  }
};

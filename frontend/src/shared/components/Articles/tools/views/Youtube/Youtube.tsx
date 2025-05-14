import { FC, HTMLAttributes, useEffect, useState } from 'react';

interface IProps extends HTMLAttributes<HTMLDivElement> {
  url: string;
  width?: number;
  height?: number;
  startTime?: number;
}

const YouTubeVideo: FC<IProps> = ({ url, width, height, startTime, ...props }) => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<number>(startTime || 0);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      const { id, time } = extractVideoIdAndTime(url);
      setVideoId(id);
      setTimestamp(startTime ?? time); // Используем переданный startTime или извлечённый из URL
    }, 500);

    return () => clearTimeout(handler);
  }, [url, startTime]);

  useEffect(() => {
    if (videoId) {
      isValidYouTubeVideo(videoId).then(setIsValid);
    } else {
      setIsValid(false);
    }
  }, [videoId]);

  if (isValid === false) {
    return <p>Видео не найдено или удалено.</p>;
  }

  return (
    <div {...props}>
      {isValid ? (
        <iframe

          width={width ? `${width}%` : '560'}
          height={height || '315'}
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
};

const extractVideoIdAndTime = (url: string) => {
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  const timeMatch = url.match(/[?&](?:t|start)=(\d+)/);
  return {
    id: match && match[1] ? match[1] : '',
    time: timeMatch && timeMatch[1] ? parseInt(timeMatch[1], 10) : 0
  };
};

const isValidYouTubeVideo = async (videoId: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    return response.ok;
  } catch {
    return false;
  }
};

export default YouTubeVideo;

import { FC, useEffect, useState } from 'react';
import css from './Loading.module.css';

interface IProps { }

const Loading: FC<IProps> = () => {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots.length > 5 ? "." : prevDots + "."));
    }, 500);

    return () => clearInterval(interval); // Очистка таймера при размонтировании
  }, []);

  return (
    <div className={css.wrapper}>
      Идёт загрузка{dots}
    </div>
  );
};

export default Loading;

import { FC } from 'react';
import css from './DialogItem.module.css';
import { NormalizedDialog } from '../../types';
import { FaBroadcastTower } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa6';
import { IoIosChatboxes } from 'react-icons/io';
import { RiRobot2Line } from 'react-icons/ri';
import { useAppDispatch, useAppSelector } from '../../../../core/store/MainStore';
import Checkbox from '../../../../shared/components/UI/Checkbox/Checkbox';
import { addChatImportId, deleteChatImportId } from '../../../../core/store/slices/dialogSlice';

interface IProps {
  item: NormalizedDialog;
  query?: string;
  index: number;
}

const highlightText = (text: string, query: string) => {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.split(regex).map((part, index) =>
    regex.test(part) ? (
      <span key={index} className={css.highlight}>
        {part}
      </span>
    ) : (
      part
    )
  );
};

const DialogItem: FC<IProps> = ({ item, query, index }) => {
  const { nowImporting, importingChatIds } = useAppSelector(s => s.dialogs);
  const dispatch = useAppDispatch();

  const handleCheckboxChange = () => {
    if (importingChatIds.includes(item.id)) {
      dispatch(deleteChatImportId(item.id));
    } else {
      dispatch(addChatImportId(item.id));
    }
  };

  return (
    <div className={`${css.wrapper} ${index % 2 == 0 ? css.even : css.odd}`}>
      <div className={css.st}>
        {nowImporting && (
          <Checkbox
            checked={importingChatIds.includes(item.id)}
            onChange={handleCheckboxChange}
          />
        )}

        <div className={css.title}>
          {query ? highlightText(item.title, query) : item.title}
        </div>
        <div className={css.description}>
          {item.description && (query ? highlightText(item.description, query) : item.description)}
        </div>
      </div>

      <div className={css.nd}>
        <FaBroadcastTower
          className={`${css.icon} ${(item.type === 'Channel' && !item.canSendMessages) ? css.greenIcon : ''}`}
        />
        <FaUser
          className={`${css.icon} ${(item.type === 'User' && !item.isBot) ? css.greenIcon : ''}`}
        />
        <IoIosChatboxes
          className={`${css.icon} ${(item.type === 'Channel' && item.canSendMessages) ? css.greenIcon : ''}`}
        />
        <RiRobot2Line
          className={`${css.icon} ${(item.type === 'User' && item.isBot) ? css.greenIcon : ''}`}
        />
      </div>
    </div>
  );
};

export default DialogItem;
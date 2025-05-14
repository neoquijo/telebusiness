import { FC } from 'react';
import css from './ChatItem.module.css';
import { NormalizedDialog } from '../../AccountsModule/types';
import { FaBroadcastTower } from 'react-icons/fa';
import { RiRobot2Line } from 'react-icons/ri';
import { IoIosChatboxes } from 'react-icons/io';
import { FaUser } from 'react-icons/fa6';

interface IProps {
  item: NormalizedDialog
}

const ChatItem: FC<IProps> = ({ item: chat }) => {
  return (
    <div className={css.wrapper}>
      <div key={chat.id} className={css.chatItem}>
        <h3 className={css.chatTitle}>{chat.title}</h3>
        {chat.description && (
          <a href={`https://t.me/${chat.description}`} >{chat.description}</a>
          // <p className={css.chatDescription}>{chat.description}</p>
        )}
        <div className={css.chatMeta}>
          <span className={css.chatType}>{chat.type}</span>
          {chat.username && (
            <span className={css.chatUsername}>@{chat.username}</span>
          )}
        </div>

        <div className={css.nd}>

          <FaBroadcastTower
            className={`${css.icon} ${(chat.type === 'Channel' && !chat.canSendMessages) ? css.greenIcon : ''}`}
          />
          <FaUser
            className={`${css.icon} ${(chat.type === 'User' && !chat.isBot) ? css.greenIcon : ''}`}
          />
          <IoIosChatboxes
            className={`${css.icon} ${(chat.type === 'Chat') ? css.greenIcon : ''}`}
          />
          <RiRobot2Line
            className={`${css.icon} ${(chat.type === 'User' && chat.isBot) ? css.greenIcon : ''}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
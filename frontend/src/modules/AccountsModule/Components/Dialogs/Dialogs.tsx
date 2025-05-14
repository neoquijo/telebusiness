import { FC } from 'react';
import css from './Dialogs.module.css';
import { NormalizedDialog } from '../../types';
import DialogItem from './DialogItem';
import { FaBroadcastTower, FaUser, FaCheck } from 'react-icons/fa';
import { RiRobot2Line } from 'react-icons/ri';
import { IoIosChatboxes } from 'react-icons/io';
import { useAppSelector, useAppDispatch } from '../../../../core/store/MainStore';
import SearchInput from '../../../../shared/components/UI/SearchInput/SearchInput';
import Button from '../../../../shared/components/UI/Button/Button';
import { addFilteredDialogsToImport, setFilterType, setSearchQuery } from '../../../../core/store/slices/dialogSlice';

interface IProps {
  dialogs: NormalizedDialog[];
}

const AccountDialogs: FC<IProps> = ({ dialogs }) => {
  const dispatch = useAppDispatch();
  const {
    importingChatIds,
    filterType,
    searchQuery,
    nowImporting
  } = useAppSelector(s => s.dialogs);

  // Filtering logic
  const getFilteredDialogs = () => {
    // Filter by type
    const filteredByType = dialogs.filter((dialog) => {
      if (!filterType) return true;
      switch (filterType) {
        case 'private':
          return dialog.type === 'User' && !dialog.isBot;
        case 'bot':
          return dialog.type === 'User' && !!dialog.isBot;
        case 'channel':
          return dialog.type === 'Channel' && !dialog.canSendMessages;
        case 'chat':
          return dialog.type === 'Channel' && !!dialog.canSendMessages;
        case 'selected':
          return importingChatIds.includes(dialog.id);
        default:
          return true;
      }
    });

    // Filter by search query
    return filteredByType.filter((dialog) => {
      const query = searchQuery.toLowerCase();
      return (
        dialog.title.toLowerCase().includes(query) ||
        (dialog.description || '').toLowerCase().includes(query)
      );
    });
  };

  const filteredData = getFilteredDialogs();

  const handleFilterTypeChange = (type: 'private' | 'bot' | 'channel' | 'chat' | 'selected' | null) => {
    dispatch(setFilterType(type === filterType ? null : type));
  };

  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const handleSelectAllFiltered = () => {
    dispatch(addFilteredDialogsToImport(filteredData));
  };

  return (
    <>
      <div className={css.filters}>
        <SearchInput
          style={{ width: '400px' }}
          caption='Поиск по чатам'
          cb={handleSearchChange}
        />
        <div className={css.filterButtons}>
          <Button
            active={!filterType}
            onClick={() => handleFilterTypeChange(null)}
          >
            Показывать все
          </Button>
          <Button
            icon={FaUser}
            variant='ghost'
            active={filterType === 'private'}
            onClick={() => handleFilterTypeChange('private')}
          >
            Личная переписка
          </Button>
          <Button
            icon={RiRobot2Line}
            variant='ghost'
            active={filterType === 'bot'}
            onClick={() => handleFilterTypeChange('bot')}
          >
            Бот
          </Button>
          <Button
            icon={FaBroadcastTower}
            variant='ghost'
            active={filterType === 'channel'}
            onClick={() => handleFilterTypeChange('channel')}
          >
            Канал
          </Button>
          <Button
            icon={IoIosChatboxes}
            variant='ghost'
            active={filterType === 'chat'}
            onClick={() => handleFilterTypeChange('chat')}
          >
            Чат
          </Button>
          {importingChatIds.length > 0 &&
            <Button
              icon={FaCheck}
              variant='ghost'
              active={filterType === 'selected'}
              onClick={() => handleFilterTypeChange('selected')}
            >
              Выбранные {importingChatIds.length}
            </Button>}

          {nowImporting && (
            <div className={css.importFilterActions}>
              <Button onClick={handleSelectAllFiltered}>
                Отметить отображаемые ({filteredData.length})
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className={css.chats}>
        {filteredData.map((el, index) => (
          <DialogItem key={el.id} index={index} query={searchQuery} item={el} />
        ))}
      </div>
    </>
  );
};

export default AccountDialogs;
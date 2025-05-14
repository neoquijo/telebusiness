import React, { useState, useEffect } from 'react';
import css from './Pagination.module.css'

interface PaginationProps {
  totalItems: number;
}

interface UsePaginationReturn {
  Pagination: React.FC<PaginationProps>;
  page: number;
  limit: number;
}

const usePagination = (initialPage = 1, initialLimit = 10): UsePaginationReturn => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const Pagination: React.FC<PaginationProps> = ({ totalItems }) => {
    const totalPages = Math.ceil((totalItems + 1) / limit);
    const [inputPage, setInputPage] = useState(page);
    useEffect(() => {
      setInputPage(page);
    }, [page]);

    const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    };

    const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newLimit = parseInt(event.target.value, 10);
      setLimit(newLimit);
      setPage(1);
    };

    const handleInputPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newPage = parseInt(event.target.value, 10);
      setInputPage(newPage);
    };

    const handleGoToPage = () => {
      handlePageChange(inputPage);
    };

    const renderPageNumbers = () => {
      const pages = [];
      const startPage = Math.max(1, page - 2);
      const endPage = Math.min(totalPages, page + 2);

      if (startPage > 1) {
        pages.push(
          <div
            key={1}
            onClick={() => handlePageChange(1)}
            style={{ fontWeight: 1 === page ? 'bold' : 'normal' }}
            className={css.page}
          >
            1
          </div>,
        );
        if (startPage > 2) {
          pages.push(<span key="start-ellipsis">...</span>);
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <div
            key={i}
            onClick={() => handlePageChange(i)}
            className={i == page ? css.activePage : css.page}
          >
            {i}
          </div>,
        );
      }


      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push(<span key="end-ellipsis">...</span>);
        }
        pages.push(
          <div
            key={totalPages}
            onClick={() => handlePageChange(totalPages)}
            style={{ fontWeight: totalPages === page ? 'bold' : 'normal' }}
            className={css.page}
          >
            {totalPages}
          </div>,
        );
      }

      return pages;
    };

    return (
      <div className={css.wrapper}>
        <div className={css.pages}>
          {page > 1 && <div
            onClick={() => handlePageChange(page - 1)}
            className={css.page}
          >
            Назад
          </div>}
          {renderPageNumbers()}
          {page < totalPages && <div
            onClick={() => handlePageChange(page + 1)}
            className={css.page}
          >
            Далее
          </div>}
        </div>
        <div className={css.toPage}>
          <span>Перейти на страницу: </span>
          <input
            type="number"
            value={inputPage}
            onChange={handleInputPageChange}
            min="1"
            max={totalPages}
          />
          <div className={css.page} onClick={handleGoToPage}>Перейти</div>
        </div>
        <div>
          <span>кол-во элементов на стр.: </span>
          <select value={limit} onChange={handlePageSizeChange}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    );
  };

  return { Pagination, page, limit };
};

export default usePagination;


// import React, { useState, useEffect } from 'react';

// interface PaginationProps {
//   response: {
//     currentPage: number;
//     pageSize: number;
//     totalItems: number;
//     totalPages: number;
//   };
//   onChange: (page: number, pageSize: number) => void;
// }

// interface UsePaginationReturn {
//   Pagination: React.FC<PaginationProps>;
//   page: number;
//   limit: number;
// }

// const usePagination = (initialPage = 1, initialLimit = 10): UsePaginationReturn => {
//   const [page, setPage] = useState(initialPage);
//   const [limit, setLimit] = useState(initialLimit);

//   const Pagination: React.FC<PaginationProps> = ({ response, onChange }) => {
//     const { currentPage, totalPages } = response;
//     const [inputPage, setInputPage] = useState(currentPage);

//     // Синхронизация inputPage с currentPage
//     useEffect(() => {
//       setInputPage(currentPage);
//     }, [currentPage]);

//     const handlePageChange = (newPage: number) => {
//       if (newPage >= 1 && newPage <= totalPages) {
//         setPage(newPage);
//         onChange(newPage, limit);
//       }
//     };

//     const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//       const newLimit = parseInt(event.target.value, 10);
//       setLimit(newLimit);
//       onChange(1, newLimit); // Сброс на первую страницу при изменении лимита
//     };

//     const handleInputPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//       const newPage = parseInt(event.target.value, 10);
//       setInputPage(newPage);
//     };

//     const handleGoToPage = () => {
//       handlePageChange(inputPage);
//     };

//     const renderPageNumbers = () => {
//       const pages = [];
//       const startPage = Math.max(1, currentPage - 2); // 2 страницы до текущей
//       const endPage = Math.min(totalPages, currentPage + 2); // 2 страницы после текущей

//       // Добавляем первую страницу, если она не входит в диапазон
//       if (startPage > 1) {
//         pages.push(
//           <button
//             key={1}
//             onClick={() => handlePageChange(1)}
//             style={{ fontWeight: 1 === currentPage ? 'bold' : 'normal' }}
//           >
//             1
//           </button>,
//         );
//         if (startPage > 2) {
//           pages.push(<span key="start-ellipsis">...</span>);
//         }
//       }

//       // Добавляем страницы в диапазоне
//       for (let i = startPage; i <= endPage; i++) {
//         pages.push(
//           <button
//             key={i}
//             onClick={() => handlePageChange(i)}
//             style={{ fontWeight: i === currentPage ? 'bold' : 'normal' }}
//           >
//             {i}
//           </button>,
//         );
//       }

//       // Добавляем последнюю страницу, если она не входит в диапазон
//       if (endPage < totalPages) {
//         if (endPage < totalPages - 1) {
//           pages.push(<span key="end-ellipsis">...</span>);
//         }
//         pages.push(
//           <button
//             key={totalPages}
//             onClick={() => handlePageChange(totalPages)}
//             style={{ fontWeight: totalPages === currentPage ? 'bold' : 'normal' }}
//           >
//             {totalPages}
//           </button>,
//         );
//       }

//       return pages;
//     };

//     return (
//       <div>
//         <div>
//           <button
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//           >
//             Previous
//           </button>
//           {renderPageNumbers()}
//           <button
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//           >
//             Next
//           </button>
//         </div>
//         <div>
//           <span>Go to page: </span>
//           <input
//             type="number"
//             value={inputPage}
//             onChange={handleInputPageChange}
//             min="1"
//             max={totalPages}
//           />
//           <button onClick={handleGoToPage}>Go</button>
//         </div>
//         <div>
//           <span>Items per page: </span>
//           <select value={limit} onChange={handlePageSizeChange}>
//             <option value={10}>10</option>
//             <option value={20}>20</option>
//             <option value={50}>50</option>
//             <option value={100}>100</option>
//           </select>
//         </div>
//       </div>
//     );
//   };

//   return { Pagination, page, limit };
// };

// export default usePagination;
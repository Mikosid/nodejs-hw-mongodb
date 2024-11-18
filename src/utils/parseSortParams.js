const sortOrderList = ['asc', 'desc'];

export const parseSortParams = ({ sortBy, sortOrder }, sortByList) => {
  const parsedSortOrder = sortOrderList.includes(sortOrder)
    ? sortOrder
    : sortOrderList[0];

  const parsetSortBy = sortByList.includes(sortBy) ? sortBy : '_id';
  return {
    sortBy: parsetSortBy,
    sortOrder: parsedSortOrder,
  };
};

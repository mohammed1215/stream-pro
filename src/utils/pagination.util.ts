export function buildPaginationMeta(
  totalCount: number,
  pageNumber: number,
  pageSize: number,
) {
  const totalPages = Math.ceil(totalCount / pageSize);
  return {
    totalCount,
    totalPages,
    hasNextPage: pageNumber < totalPages,
  };
}

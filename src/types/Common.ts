export type Pagination = {
  totalRecord: number;
  totalPage: number;
  limit: number;
  page: number;
  nextPage: number | null;
  prevPage: number | null;
};

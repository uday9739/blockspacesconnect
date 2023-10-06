export abstract class PagedResults<T> {
  count: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  data: T;


  constructor(data: T, count: number, currentPage: number, take: number) {
    this.data = data;
    this.totalPages = Math.ceil(count / take);
    this.currentPage = Number(currentPage);
    this.hasNext = currentPage < this.totalPages;
    this.count = count;
    // totalPages: Math.ceil(count / take),
    // currentPage: Number(page),
  }
}
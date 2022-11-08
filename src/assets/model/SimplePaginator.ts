import { EventEmitter } from "@angular/core";

export class SimplePaginator {
    currentPage: number = 1;
    allPages: number = 1;

    pageSize: string = '50';

    totalItems: number = 0;
    totalUnfilteredItems: number = 0;
    itemsOnCurrentPage = 0;

    get isFirstPage(): boolean { return this.currentPage === 1; }
    get isLastPage(): boolean { return this.currentPage === this.allPages }

    NewPageSelected: EventEmitter<number> = new EventEmitter<number>();

    constructor() { }

    resetPaginator(resetPageSize: boolean = false, quiet: boolean = true): void {
        if (resetPageSize) {
            this.pageSize = '50';
        }
        if (quiet) {
            this.currentPage = 1;
        } else {
            this.firstPage();
        }
    }

    CalcPageCount(recordsFiltered: number, pageSize: number): number {
        const tmp = Math.ceil(recordsFiltered / pageSize);
        return tmp === 0 ? 1 : tmp;
    }

    SetPaginatorData(response: any): void {
        this.currentPage = response.pageNumber;
        this.allPages = this.CalcPageCount(response.recordsFiltered, response.pageSize);
        this.totalItems = response.recordsFiltered;
        this.totalUnfilteredItems = response.recordsTotal;
        this.itemsOnCurrentPage = response?.data?.length ?? 0;
        console.log(
            `[SetPaginatorData]: pageNumber: ${this.currentPage}, allPages: ${this.allPages}, recordsFiltered: ${response.recordsFiltered}, pageSize: ${response.pageSize}, totalItems: ${this.totalItems}, itemsOnCurrentPage: ${this.itemsOnCurrentPage}` 
        );
    }

    nextPage(): void {
        if (!this.isLastPage) {
            this.NewPageSelected.emit(++(this.currentPage));
        }
    }

    previousPage(): void {
        if (!this.isFirstPage) {
            this.NewPageSelected.emit(--(this.currentPage));
        }
    }

    firstPage(): void {
        this.currentPage = 1;
        this.NewPageSelected.emit(this.currentPage);
    }

    lastPage(): void {
        this.currentPage = this.allPages;
        this.NewPageSelected.emit(this.currentPage);
    }

    newPageSizeSelected(): void {
        this.firstPage();
    }

    refresh(): void {
        this.NewPageSelected.emit(this.currentPage);
    }
}

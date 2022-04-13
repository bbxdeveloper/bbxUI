import { EventEmitter } from "@angular/core";

export class SimplePaginator {
    currentPage: number = 1;
    allPages: number = 1;

    pageSize: string = '50';

    totalItems: number = 0;
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
        this.NewPageSelected.emit(this.currentPage);
    }

    refresh(): void {
        this.NewPageSelected.emit(this.currentPage);
    }
}

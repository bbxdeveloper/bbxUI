import { EventEmitter } from "@angular/core";

export class SimplePaginator {
    _currentPage: number = 1;
    get currentPage(): number {
        return this._currentPage
    }
    set currentPage(pageNumber: number) {
        if (pageNumber > 0) {
            this._currentPage = pageNumber
        } else {
            throw Error(`Invalid page number: ${pageNumber}`)
        }
    }

    allPages: number = 1;

    private readonly defaultPageSize = '50'

    pageSize: string = this.defaultPageSize;

    totalItems: number = 0;
    totalUnfilteredItems: number = 0;
    itemsOnCurrentPage = 0;

    get isFirstPage(): boolean { return this._currentPage === 1; }
    get isLastPage(): boolean { return this._currentPage === this.allPages }

    NewPageSelected: EventEmitter<number> = new EventEmitter<number>();

    constructor() { }

    resetPaginator(resetPageSize: boolean = false, quiet: boolean = true): void {
        if (resetPageSize) {
            this.pageSize = this.defaultPageSize;
        }
        if (quiet) {
            this._currentPage = 1;
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
            `[SetPaginatorData]: pageNumber: ${this._currentPage}, allPages: ${this.allPages}, recordsFiltered: ${response.recordsFiltered}, pageSize: ${response.pageSize}, totalItems: ${this.totalItems}, itemsOnCurrentPage: ${this.itemsOnCurrentPage}`
        );
    }

    nextPage(): void {
        if (!this.isLastPage) {
            this.NewPageSelected.emit(++(this._currentPage));
        }
    }

    previousPage(): void {
        if (!this.isFirstPage) {
            this.NewPageSelected.emit(--(this._currentPage));
        }
    }

    firstPage(): void {
        this.currentPage = 1;
        this.NewPageSelected.emit(this._currentPage);
    }

    lastPage(): void {
        this.currentPage = this.allPages;
        this.NewPageSelected.emit(this._currentPage);
    }

    newPageSizeSelected(): void {
        this.firstPage();
    }

    refresh(): void {
        this.NewPageSelected.emit(this._currentPage);
    }
}

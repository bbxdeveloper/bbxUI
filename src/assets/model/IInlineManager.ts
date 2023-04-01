export interface IInlineManager {
    ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void;
    ChooseDataForCustomerForm(): void;
    RefreshData(): void;
    IsTableFocused: boolean;
    TableRowDataChanged(changedData?: any, index?: number, col?: string): void;
    RecalcNetAndVat(): void;
}
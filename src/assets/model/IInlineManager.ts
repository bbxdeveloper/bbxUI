export interface IInlineManager {
    ChooseDataForTableRow(rowIndex: number): void;
    ChooseDataForForm(): void;
    RefreshData(): void;
    IsTableFocused: boolean;
    TableRowDataChanged(changedData?: any, index?: number): void;
}
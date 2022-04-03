export interface IInlineManager {
    ChooseDataForTableRow(rowIndex: number): void;
    ChooseDataForForm(): void;
    RefreshData(): void;
    IsTableFocused: boolean;
}
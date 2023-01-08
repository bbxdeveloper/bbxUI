/**
 * For inline editable grids
 */
export interface IEditable {
    /**
     * All required fields have value? Can we get to the next - and new - editable row in table?
     */
    IsUnfinished(): boolean;
}
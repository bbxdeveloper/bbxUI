import { TreeGridNode } from "../TreeGridNode";

export interface SelectedCell<T = any> {
    row: TreeGridNode<T>, rowPos: number, col: string, colPos: number
}
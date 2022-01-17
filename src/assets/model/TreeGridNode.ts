export interface TreeGridNode<T> {
    data: T;
    children?: TreeGridNode<T>[];
    expanded?: boolean;
}

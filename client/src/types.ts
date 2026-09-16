export type Column<T> = {
    key: keyof T;
    title: string;
    sizePercentage: number;
    render?: (item: T) => React.ReactNode;
};
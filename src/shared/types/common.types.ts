export type Pagination = {
    currentPage: number,
    pageSize: number,
    totalData: number,
    totalPages: number,
}

export type TRole = 'user' | 'vendor' | 'admin';

export type TSubscription = 'basic' | 'medium' | 'vip';

export type TSortOptions = {
    [key: string]: 'ascending' | 'descending',
}
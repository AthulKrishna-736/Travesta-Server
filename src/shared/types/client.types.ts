export type TRole = 'user' | 'vendor' | 'admin';

export type TSubscription = 'basic' | 'medium' | 'vip';

export type TSortOptions = {
    [key: string]: 'ascending' | 'descending',
}
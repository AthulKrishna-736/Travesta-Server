export type TCreateNotificationDTO = {
    userId: string;
    title: string;
    message: string;
}

export type TResponseNotificationDTO = {
    id: string;
    userId: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}
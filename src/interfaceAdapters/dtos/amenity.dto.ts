import { TAmenityType } from "../../domain/interfaces/model/amenities.interface";

export type TCreateAmenityDTO = {
    name: string;
    type: TAmenityType;
    description: string;
};

export type TUpdateAmenityDTO = {
    name?: string;
    type?: TAmenityType;
    description?: string;
    isActive?: boolean;
};

export type TResponseAmenityDTO = {
    id: string;
    name: string;
    type: TAmenityType;
    description: string;
    isActive: boolean;
    createdAt: Date;
    updateAt: Date;
};
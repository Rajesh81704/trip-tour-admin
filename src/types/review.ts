import { Package } from "./package";
import { User } from "./user";

export interface Review {
    _id: string;
    rating: number;
    comment: string;
    user: User;
    package: Package;
    createdAt: Date;
    updatedAt: Date;
}   
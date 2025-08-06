import { Review } from "./review";

export interface PackageLocation {
    city: string;
    state: string;
    destination: string;
}

export interface PackageDuration {
    day: number;
    night: number;
}

export interface PackageItineraryItem {
    day: number;
    title: string;
    description: string;
    _id: string;
}

export interface Package {
    _id: string;
    location: PackageLocation;
    duration: PackageDuration;
    title: string;
    price: number;
    reviews: Review[];
    images: {
        url: string;
        public_id: string;
        _id: string;
    }[];
    features: string[];
    discount: number;
    description: string;
    highlights: string[];
    itinerary: PackageItineraryItem[];
    inclusions: string[];
    exclusions: string[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}

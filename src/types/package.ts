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
    hotelName?: string;
    city?: string;
    _id?: string;
}

export interface FlightOption {
    type: "main" | "internal";
    airline: string;
    flightNumber: string;
    departureCity: string;
    departureAirport: string;
    departureTime: string;
    departureDate: string;
    arrivalCity: string;
    arrivalAirport: string;
    arrivalTime: string;
    arrivalDate: string;
    duration: string;
    class: "economy" | "business" | "first";
    price: number;
    description?: string;
    image?: { url: string; public_id: string };
    _id?: string;
}

export interface HotelOption {
    location: string;
    hotelName: string;
    nights: number;
    roomType: string;
    amenities?: string[];
    price: number;
    starRating?: number;
    checkInDate?: string;
    checkOutDate?: string;
    description?: string;
    /** Multiple hotel images */
    images?: { url: string; public_id: string }[];
    /** Legacy single image */
    image?: { url: string; public_id: string };
    _id?: string;
}

export interface SightseeingOption {
    name: string;
    description?: string;
    location?: string;
    duration?: string;
    images?: { url: string; public_id: string }[];
    _id?: string;
}

export interface Package {
    _id: string;
    location: PackageLocation;
    duration: PackageDuration;
    title: string;
    price: number;
    reviews: Review[];
    images: { url: string; public_id: string }[];
    features: string[];
    discount: number;
    description: string;
    highlights: string[];
    itinerary: PackageItineraryItem[];
    inclusions: string[];
    exclusions: string[];
    flights?: FlightOption[];
    hotels?: HotelOption[];
    sightseeings?: SightseeingOption[];
    category: string;
    createdAt: Date;
    updatedAt: Date;
}

export const PACKAGE_CATEGORIES = [
    "Adventure",
    "Cultural",
    "Luxury",
    "Budget",
    "Honeymoon",
    "Family",
    "Nature & Adventure",
    "Beach",
    "Hill Station",
    "Wildlife",
    "Pilgrimage",
    "International",
    "Cruise",
    "Weekend Getaway",
] as const;

export type PackageCategory = typeof PACKAGE_CATEGORIES[number];

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
    image?: {
        url: string;
        public_id: string;
    };
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
    image?: {
        url: string;
        public_id: string;
    };
    _id?: string;
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
    }[];
    features: string[];
    discount: number;
    description: string;
    highlights: string[];
    itinerary: PackageItineraryItem[];
    inclusions: string[];
    exclusions: string[];
    flights?: FlightOption[];
    hotels?: HotelOption[];
    category: string;
    createdAt: Date;
    updatedAt: Date;
}

export type PresetType = "hotel" | "sightseeing" | "itinerary";

export interface PresetImage {
  url: string;
  public_id: string;
}

export interface PresetHotelData {
  hotelName: string;
  location?: string;
  starRating?: number;
  roomType?: string;
  amenities?: string[];
  price?: number;
  description?: string;
  images?: PresetImage[];
}

export interface PresetSightseeingData {
  name: string;
  description?: string;
  location?: string;
  duration?: string;
  images?: PresetImage[];
}

export interface PresetItineraryData {
  title: string;
  description: string;
  city?: string;
  hotelName?: string;
}

export interface Preset {
  _id: string;
  destination: string;
  city?: string;
  type: PresetType;
  data: PresetHotelData | PresetSightseeingData | PresetItineraryData;
  createdAt?: string;
  updatedAt?: string;
}

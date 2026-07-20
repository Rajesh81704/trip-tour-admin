"use client";
import { useState } from "react";
import { Package } from "@/types/package";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Star, Plane, Hotel, MapPin } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ConfirmDelete from "./confirmDelete";

interface PackageCardProps {
  pkg: Package;
  onDelete: (id: string) => Promise<void>;
}

function getAverageRating(reviews: Package["reviews"]) {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return (sum / reviews.length).toFixed(1);
}

export default function PackageCard({ pkg, onDelete }: PackageCardProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [expandedSection, setExpandedSection] = useState<"flights" | "hotels" | null>(null);

  const handleDelete = async () => {
    await onDelete(pkg._id);
    setVisible(false);
  };

  if (!visible) return null;

  const hasFlights = pkg.flights && pkg.flights.length > 0;
  const hasHotels = pkg.hotels && pkg.hotels.length > 0;

  return (
    <Card className="w-full max-w-md shadow-lg hover:shadow-xl transition-shadow duration-200 py-0 flex flex-col">
      <CardHeader className="p-0 relative">
        <div className="aspect-[16/9] w-full overflow-hidden rounded-t-md">
          <Image
            src={pkg.images[0].url}
            alt={pkg.title}
            className="object-cover w-full h-full"
            width={500}
            height={500}
          />
        </div>
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <Badge variant="secondary">
            {pkg.location.city}, {pkg.location.state}
          </Badge>
          {pkg.discount > 0 && (
            <Badge variant="destructive">-{pkg.discount}%</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="py-4 px-6 flex-1">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg font-semibold">{pkg.title}</CardTitle>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium">
              {getAverageRating(pkg.reviews)}
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              ({pkg.reviews.length})
            </span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground mb-2">
          {pkg.location.destination}
        </div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs bg-muted px-2 py-1 rounded">
            {pkg.duration.day}D/{pkg.duration.night}N
          </span>
          <span className="text-xs text-muted-foreground">
            {pkg.highlights.slice(0, 2).join(", ")}
            {pkg.highlights.length > 2 && " ..."}
          </span>
        </div>
        <div className="text-sm line-clamp-2 mb-3">{pkg.description}</div>

        {/* Flights & Hotels Info */}
        <div className="space-y-2 mb-3">
          {/* Flights Summary */}
          {hasFlights && (
            <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded border border-blue-200 dark:border-blue-800">
              <button
                onClick={() => setExpandedSection(expandedSection === "flights" ? null : "flights")}
                className="w-full flex items-center justify-between text-sm font-medium text-blue-700 dark:text-blue-300 hover:opacity-75 transition-opacity"
              >
                <div className="flex items-center gap-1">
                  <Plane className="w-4 h-4" />
                  <span>{pkg.flights?.length} Flight{pkg.flights?.length !== 1 ? "s" : ""}</span>
                </div>
                <span className="text-xs">{expandedSection === "flights" ? "▼" : "▶"}</span>
              </button>
              {expandedSection === "flights" && (
                <div className="mt-2 space-y-1 text-xs text-blue-600 dark:text-blue-200">
                  {pkg.flights?.map((flight, idx) => (
                    <div key={idx} className="flex items-start gap-2 pl-2 border-l-2 border-blue-300">
                      <div className="flex-1">
                        <div className="font-medium">{flight.airline} #{flight.flightNumber}</div>
                        <div className="opacity-75">
                          {flight.departureCity} → {flight.arrivalCity}
                        </div>
                        <div className="opacity-75">
                          ₹{flight.price?.toLocaleString() || "N/A"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Hotels Summary */}
          {hasHotels && (
            <div className="bg-green-50 dark:bg-green-950 p-2 rounded border border-green-200 dark:border-green-800">
              <button
                onClick={() => setExpandedSection(expandedSection === "hotels" ? null : "hotels")}
                className="w-full flex items-center justify-between text-sm font-medium text-green-700 dark:text-green-300 hover:opacity-75 transition-opacity"
              >
                <div className="flex items-center gap-1">
                  <Hotel className="w-4 h-4" />
                  <span>{pkg.hotels?.length} Hotel{pkg.hotels?.length !== 1 ? "s" : ""}</span>
                </div>
                <span className="text-xs">{expandedSection === "hotels" ? "▼" : "▶"}</span>
              </button>
              {expandedSection === "hotels" && (
                <div className="mt-2 space-y-1 text-xs text-green-600 dark:text-green-200">
                  {pkg.hotels?.map((hotel, idx) => (
                    <div key={idx} className="flex items-start gap-2 pl-2 border-l-2 border-green-300">
                      <div className="flex-1">
                        <div className="font-medium">{hotel.hotelName}</div>
                        <div className="opacity-75 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {hotel.location} • {hotel.nights}N
                        </div>
                        <div className="opacity-75">
                          ₹{hotel.price?.toLocaleString() || "N/A"}/night
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {pkg.discount > 0 ? (
            <>
              <span className="text-lg font-bold text-primary">
                ₹{((pkg.price * (100 - pkg.discount)) / 100).toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">
                {pkg.discount}% off
              </span>
              <span className="text-sm line-through text-muted-foreground">
                ₹{pkg.price.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-primary">
              ₹{pkg.price.toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-4 flex gap-2">
        <Button
          className="w-full cursor-pointer"
          variant="default"
          onClick={() => router.push(`/packages/edit/${pkg._id}`)}
        >
          Edit <Pencil className="w-4 h-4" />
        </Button>
        <ConfirmDelete onConfirm={handleDelete} title="Package" />
      </CardFooter>
    </Card>
  );
}

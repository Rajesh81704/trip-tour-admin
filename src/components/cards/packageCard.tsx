"use client";
import { useState } from "react";
import { Package } from "@/types/package";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Star,
  Plane,
  Hotel,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Camera,
  Sparkles,
  Tag,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ConfirmDelete from "./confirmDelete";

interface PackageCardProps {
  pkg: Package;
  onDelete: (id: string) => Promise<void>;
}

function getAverageRating(reviews: Package["reviews"]) {
  if (!reviews || reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return (sum / reviews.length).toFixed(1);
}

function formatPrice(amount: number): string {
  return Math.round(amount).toLocaleString("en-IN");
}

export default function PackageCard({ pkg, onDelete }: PackageCardProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [expandedSection, setExpandedSection] = useState<"flights" | "hotels" | "sightseeings" | null>(null);

  const handleDelete = async () => {
    await onDelete(pkg._id);
    setVisible(false);
  };

  if (!visible) return null;

  const hasFlights = pkg.flights && pkg.flights.length > 0;
  const hasHotels = pkg.hotels && pkg.hotels.length > 0;
  const hasSightseeings = pkg.sightseeings && pkg.sightseeings.length > 0;
  const rating = getAverageRating(pkg.reviews);

  const discountedPrice = pkg.discount > 0
    ? pkg.price * (1 - pkg.discount / 100)
    : pkg.price;

  const mainImageUrl = pkg.images?.[0]?.url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="group relative bg-card text-card-foreground border border-border/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* ── Image & Top Badges ────────────────────────────────────────────── */}
      <div className="aspect-[16/10] w-full overflow-hidden relative bg-muted">
        <Image
          src={mainImageUrl}
          alt={pkg.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient Overlay for visual quality & readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-75 transition-opacity" />

        {/* Location Badge (Top Left) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-xs border border-white/20">
            <MapPin className="w-3 h-3 text-rose-400" />
            {pkg.location.city}, {pkg.location.state}
          </span>
          {pkg.category && (
            <span className="inline-flex items-center gap-1 bg-primary/90 backdrop-blur-md text-primary-foreground text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
              <Tag className="w-2.5 h-2.5" />
              {pkg.category}
            </span>
          )}
        </div>

        {/* Discount Badge (Top Right) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {pkg.discount > 0 && (
            <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-rose-600 to-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-md animate-pulse">
              <Sparkles className="w-3 h-3" />
              {pkg.discount}% OFF
            </span>
          )}
        </div>

        {/* Bottom Image Overlay Info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            {pkg.duration.day} Days / {pkg.duration.night} Nights
          </span>

          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-yellow-400">
            <Star className="w-3.5 h-3.5 fill-yellow-400" />
            <span>{rating ?? "New"}</span>
            {pkg.reviews?.length > 0 && (
              <span className="text-[10px] text-white/80 font-normal">
                ({pkg.reviews.length})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Content Body ─────────────────────────────────────────────────── */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Title */}
          <h3 className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors tracking-tight">
            {pkg.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium line-clamp-1">
            Destination: {pkg.location.destination}
          </p>

          {/* Short Description */}
          <p className="text-xs text-muted-foreground/90 line-clamp-2 mt-2 leading-relaxed">
            {pkg.description}
          </p>
        </div>

        {/* Highlights Tags */}
        {pkg.highlights && pkg.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {pkg.highlights.slice(0, 3).map((hl, i) => (
              <span
                key={i}
                className="text-[11px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-md border border-border/40"
              >
                {hl}
              </span>
            ))}
            {pkg.highlights.length > 3 && (
              <span className="text-[10px] font-semibold text-primary self-center">
                +{pkg.highlights.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Flights / Hotels / Sightseeings Compact Badges */}
        {(hasFlights || hasHotels || hasSightseeings) && (
          <div className="space-y-1.5 pt-2 border-t border-border/40">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {hasFlights && (
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === "flights" ? null : "flights")}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold hover:bg-blue-500/20 transition-colors"
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>{pkg.flights?.length} Flight{pkg.flights?.length !== 1 ? "s" : ""}</span>
                  {expandedSection === "flights" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}

              {hasHotels && (
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === "hotels" ? null : "hotels")}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold hover:bg-emerald-500/20 transition-colors"
                >
                  <Hotel className="w-3.5 h-3.5" />
                  <span>{pkg.hotels?.length} Hotel{pkg.hotels?.length !== 1 ? "s" : ""}</span>
                  {expandedSection === "hotels" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}

              {hasSightseeings && (
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === "sightseeings" ? null : "sightseeings")}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold hover:bg-purple-500/20 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{pkg.sightseeings?.length} Sightseeing</span>
                  {expandedSection === "sightseeings" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>

            {/* Expanded Flights List */}
            {expandedSection === "flights" && pkg.flights && (
              <div className="bg-blue-50/70 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-200 dark:border-blue-800/60 space-y-1.5 text-xs text-blue-900 dark:text-blue-200">
                {pkg.flights.map((flight, idx) => (
                  <div key={idx} className="flex justify-between items-start pb-1 border-b border-blue-200/50 dark:border-blue-800/40 last:border-0 last:pb-0">
                    <div>
                      <div className="font-semibold">{flight.airline} ({flight.flightNumber})</div>
                      <div className="text-[11px] text-blue-600 dark:text-blue-300">
                        {flight.departureCity} → {flight.arrivalCity} ({flight.class})
                      </div>
                    </div>
                    <div className="font-bold text-[11px]">₹{formatPrice(flight.price)}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Expanded Hotels List */}
            {expandedSection === "hotels" && pkg.hotels && (
              <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-1.5 text-xs text-emerald-900 dark:text-emerald-200">
                {pkg.hotels.map((hotel, idx) => (
                  <div key={idx} className="flex justify-between items-start pb-1 border-b border-emerald-200/50 dark:border-emerald-800/40 last:border-0 last:pb-0">
                    <div>
                      <div className="font-semibold">{hotel.hotelName} {hotel.starRating ? `(${hotel.starRating}★)` : ""}</div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-300">
                        {hotel.location} • {hotel.roomType} ({hotel.nights}N)
                      </div>
                    </div>
                    <div className="font-bold text-[11px]">₹{formatPrice(hotel.price)}/N</div>
                  </div>
                ))}
              </div>
            )}

            {/* Expanded Sightseeings List */}
            {expandedSection === "sightseeings" && pkg.sightseeings && (
              <div className="bg-purple-50/70 dark:bg-purple-950/40 p-2.5 rounded-xl border border-purple-200 dark:border-purple-800/60 space-y-1.5 text-xs text-purple-900 dark:text-purple-200">
                {pkg.sightseeings.map((sg, idx) => (
                  <div key={idx} className="pb-1 border-b border-purple-200/50 dark:border-purple-800/40 last:border-0 last:pb-0">
                    <div className="font-semibold">{sg.name}</div>
                    {sg.duration && <div className="text-[11px] text-purple-600 dark:text-purple-300">{sg.duration}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Price & Action Buttons Section */}
        <div className="pt-3 border-t border-border/40 space-y-3">
          {/* Pricing */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-foreground tracking-tight">
                ₹{formatPrice(discountedPrice)}
              </span>
              {pkg.discount > 0 && (
                <span className="text-xs text-muted-foreground line-through font-medium">
                  ₹{formatPrice(pkg.price)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">per person</span>
          </div>

          {/* Action Buttons: Edit and Delete */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              className="flex-1 cursor-pointer font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-xs transition-all shadow-xs gap-1.5"
              onClick={() => router.push(`/packages/edit/${pkg._id}`)}
            >
              <Pencil className="w-3.5 h-3.5" /> Edit Package
            </Button>
            <ConfirmDelete
              title="Package"
              onConfirm={handleDelete}
              className="h-9 px-3 rounded-xl text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-0 transition-colors cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

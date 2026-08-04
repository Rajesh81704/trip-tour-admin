"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Preset, PresetType, PresetHotelData, PresetSightseeingData, PresetItineraryData } from "@/types/preset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Hotel, Camera, MapPin, Star, Clock, Check, X, Bookmark, Building2 } from "lucide-react";
import Image from "next/image";

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: PresetType;
  defaultDestination?: string;
  onImport: (selectedPresets: Preset[]) => void;
}

export default function PresetModal({
  isOpen,
  onClose,
  targetType,
  defaultDestination = "",
  onImport,
}: PresetModalProps) {
  const [destinationSearch, setDestinationSearch] = useState(defaultDestination);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableDestinations, setAvailableDestinations] = useState<string[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync default destination when modal opens
  useEffect(() => {
    if (isOpen) {
      setDestinationSearch(defaultDestination);
      setSelectedIds([]);
    }
  }, [isOpen, defaultDestination]);

  // Fetch unique destinations
  const fetchDestinations = useCallback(async () => {
    try {
      const res = await api.get<{ data: string[] }>("/presets/destinations");
      if (res.data?.data) {
        setAvailableDestinations(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch destinations:", err);
    }
  }, []);

  // Fetch presets matching type and filters
  const fetchPresets = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { type: targetType };
      if (destinationSearch.trim()) params.destination = destinationSearch.trim();
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get<{ data: Preset[] }>("/presets", params);
      setPresets(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch presets:", err);
      setPresets([]);
    } finally {
      setLoading(false);
    }
  }, [targetType, destinationSearch, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      fetchDestinations();
      fetchPresets();
    }
  }, [isOpen, fetchDestinations, fetchPresets]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleImport = () => {
    const selected = presets.filter((p) => selectedIds.includes(p._id));
    onImport(selected);
    onClose();
  };

  const getTitle = () => {
    switch (targetType) {
      case "hotel":
        return "Import Hotel from Presets";
      case "sightseeing":
        return "Import Sightseeing from Presets";
      case "itinerary":
        return "Import Itinerary Day from Presets";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Bookmark className="w-5 h-5 text-amber-500" />
            <span>{getTitle()}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-border bg-card flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Destination (e.g. Goa, Manali, Bali)..."
              value={destinationSearch}
              onChange={(e) => setDestinationSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Destination Pills */}
        {availableDestinations.length > 0 && (
          <div className="px-4 py-2 border-b border-border bg-muted/20 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted-foreground font-medium mr-1">Quick filter:</span>
            <button
              type="button"
              onClick={() => setDestinationSearch("")}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                !destinationSearch
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
            >
              All
            </button>
            {availableDestinations.map((dest) => (
              <button
                type="button"
                key={dest}
                onClick={() => setDestinationSearch(dest)}
                className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                  destinationSearch.toLowerCase() === dest.toLowerCase()
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
              >
                {dest}
              </button>
            ))}
          </div>
        )}

        {/* Preset Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading presets...</div>
          ) : presets.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Building2 className="w-10 h-10 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground font-medium">No presets found matching destination.</p>
              <p className="text-xs text-muted-foreground">
                Try searching for a different destination or create new presets from the Destination Presets admin tab.
              </p>
            </div>
          ) : (
            presets.map((preset) => {
              const isSelected = selectedIds.includes(preset._id);

              if (targetType === "hotel") {
                const hotel = preset.data as PresetHotelData;
                const coverImage = hotel.images?.[0]?.url;

                return (
                  <div
                    key={preset._id}
                    onClick={() => toggleSelect(preset._id)}
                    className={`flex items-start gap-4 p-3.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
                        : "border-border hover:border-muted-foreground/40 bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-center pt-1">
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    {coverImage ? (
                      <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <Image src={coverImage} alt={hotel.hotelName} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
                        <Hotel className="w-8 h-8" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground truncate">{hotel.hotelName}</h4>
                        <span className="bg-amber-500/10 text-amber-600 text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {hotel.starRating || 3} Star
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {hotel.location || preset.destination} ({preset.destination})
                      </p>
                      {hotel.roomType && (
                        <p className="text-xs font-medium text-foreground mt-1">Room: {hotel.roomType}</p>
                      )}
                      {hotel.amenities && hotel.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {hotel.amenities.slice(0, 4).map((a, i) => (
                            <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              if (targetType === "sightseeing") {
                const sight = preset.data as PresetSightseeingData;
                const coverImage = sight.images?.[0]?.url;

                return (
                  <div
                    key={preset._id}
                    onClick={() => toggleSelect(preset._id)}
                    className={`flex items-start gap-4 p-3.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
                        : "border-border hover:border-muted-foreground/40 bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-center pt-1">
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    {coverImage ? (
                      <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <Image src={coverImage} alt={sight.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
                        <Camera className="w-8 h-8" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{sight.name}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {sight.location || preset.destination}
                        {sight.duration && (
                          <span className="flex items-center gap-1 ml-2">
                            <Clock className="w-3 h-3" />
                            {sight.duration}
                          </span>
                        )}
                      </p>
                      {sight.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5">{sight.description}</p>
                      )}
                    </div>
                  </div>
                );
              }

              if (targetType === "itinerary") {
                const itin = preset.data as PresetItineraryData;

                return (
                  <div
                    key={preset._id}
                    onClick={() => toggleSelect(preset._id)}
                    className={`flex items-start gap-4 p-3.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
                        : "border-border hover:border-muted-foreground/40 bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-center pt-1">
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground truncate">{itin.title}</h4>
                        <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded">
                          {preset.destination}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{itin.description}</p>
                      {itin.hotelName && (
                        <p className="text-xs text-amber-600 font-medium mt-1">Hotel: {itin.hotelName}</p>
                      )}
                    </div>
                  </div>
                );
              }

              return null;
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/30">
          <span className="text-xs text-muted-foreground">
            {selectedIds.length} preset{selectedIds.length === 1 ? "" : "s"} selected
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={selectedIds.length === 0}>
              Import Selected ({selectedIds.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

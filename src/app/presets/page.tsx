"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Preset, PresetType, PresetHotelData, PresetSightseeingData, PresetItineraryData, PresetImage } from "@/types/preset";
import { uploadFilesToR2 } from "@/lib/r2-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus, Trash2, Hotel, Camera, Clock, MapPin, Star,
  Search, Sparkles, Building2, Upload, X, Check, Edit2, Layers, Bookmark
} from "lucide-react";
import Image from "next/image";
import ConfirmDelete from "@/components/cards/confirmDelete";

export default function PresetsPage() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedType, setSelectedType] = useState<PresetType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [destinationsList, setDestinationsList] = useState<string[]>([]);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [deletePresetId, setDeletePresetId] = useState<string | null>(null);

  // Form State
  const [formDestination, setFormDestination] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formType, setFormType] = useState<PresetType>("hotel");

  // Hotel Form State
  const [hotelName, setHotelName] = useState("");
  const [hotelLocation, setHotelLocation] = useState("");
  const [hotelStarRating, setHotelStarRating] = useState(3);
  const [hotelRoomType, setHotelRoomType] = useState("");
  const [hotelAmenities, setHotelAmenities] = useState("");
  const [hotelPrice, setHotelPrice] = useState(0);
  const [hotelDescription, setHotelDescription] = useState("");
  const [hotelImages, setHotelImages] = useState<PresetImage[]>([]);

  // Sightseeing Form State
  const [sightName, setSightName] = useState("");
  const [sightLocation, setSightLocation] = useState("");
  const [sightDuration, setSightDuration] = useState("");
  const [sightDescription, setSightDescription] = useState("");
  const [sightImages, setSightImages] = useState<PresetImage[]>([]);

  // Itinerary Form State
  const [itinTitle, setItinTitle] = useState("");
  const [itinCity, setItinCity] = useState("");
  const [itinHotelName, setItinHotelName] = useState("");
  const [itinDescription, setItinDescription] = useState("");

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch unique destinations
  const fetchDestinations = useCallback(async () => {
    try {
      const res = await api.get<{ data: string[] }>("/presets/destinations");
      if (res.data?.data) {
        setDestinationsList(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch destinations:", err);
    }
  }, []);

  // Fetch presets list
  const fetchPresets = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedDestination) params.destination = selectedDestination;
      if (selectedType !== "all") params.type = selectedType;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get<{ data: Preset[] }>("/presets", params);
      setPresets(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch presets:", err);
      toast.error("Failed to load presets");
    } finally {
      setLoading(false);
    }
  }, [selectedDestination, selectedType, searchQuery]);

  useEffect(() => {
    fetchDestinations();
    fetchPresets();
  }, [fetchDestinations, fetchPresets]);

  // Reset form
  const resetForm = () => {
    setEditingPreset(null);
    setFormDestination("");
    setFormCity("");
    setFormType("hotel");

    setHotelName("");
    setHotelLocation("");
    setHotelStarRating(3);
    setHotelRoomType("");
    setHotelAmenities("");
    setHotelPrice(0);
    setHotelDescription("");
    setHotelImages([]);

    setSightName("");
    setSightLocation("");
    setSightDuration("");
    setSightDescription("");
    setSightImages([]);

    setItinTitle("");
    setItinCity("");
    setItinHotelName("");
    setItinDescription("");
  };

  const openCreateModal = () => {
    resetForm();
    if (selectedDestination) setFormDestination(selectedDestination);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (preset: Preset) => {
    resetForm();
    setEditingPreset(preset);
    setFormDestination(preset.destination);
    setFormCity(preset.city || "");
    setFormType(preset.type);

    if (preset.type === "hotel") {
      const h = preset.data as PresetHotelData;
      setHotelName(h.hotelName || "");
      setHotelLocation(h.location || "");
      setHotelStarRating(h.starRating || 3);
      setHotelRoomType(h.roomType || "");
      setHotelAmenities(h.amenities?.join(", ") || "");
      setHotelPrice(h.price || 0);
      setHotelDescription(h.description || "");
      setHotelImages(h.images || []);
    } else if (preset.type === "sightseeing") {
      const s = preset.data as PresetSightseeingData;
      setSightName(s.name || "");
      setSightLocation(s.location || "");
      setSightDuration(s.duration || "");
      setSightDescription(s.description || "");
      setSightImages(s.images || []);
    } else if (preset.type === "itinerary") {
      const i = preset.data as PresetItineraryData;
      setItinTitle(i.title || "");
      setItinCity(i.city || "");
      setItinHotelName(i.hotelName || "");
      setItinDescription(i.description || "");
    }

    setIsCreateModalOpen(true);
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "hotel" | "sightseeing") => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const folder = target === "hotel" ? "hotels" : "sightseeings";
      const uploaded = await uploadFilesToR2(files, folder);
      const formatted: PresetImage[] = uploaded.map((u) => ({
        url: u.publicUrl,
        public_id: u.key,
      }));

      if (target === "hotel") {
        setHotelImages((prev) => [...prev, ...formatted]);
      } else {
        setSightImages((prev) => [...prev, ...formatted]);
      }
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  // Delete preset handler
  const handleDeletePreset = async () => {
    if (!deletePresetId) return;
    try {
      await api.delete(`/presets/${deletePresetId}`);
      toast.success("Preset deleted successfully");
      setPresets((prev) => prev.filter((p) => p._id !== deletePresetId));
      fetchDestinations();
    } catch (err) {
      toast.error("Failed to delete preset");
    } finally {
      setDeletePresetId(null);
    }
  };

  // Submit preset form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDestination.trim()) {
      toast.error("Destination is required");
      return;
    }

    let dataObj: any = {};

    if (formType === "hotel") {
      if (!hotelName.trim()) {
        toast.error("Hotel Name is required");
        return;
      }
      dataObj = {
        hotelName: hotelName.trim(),
        location: hotelLocation.trim(),
        starRating: Number(hotelStarRating),
        roomType: hotelRoomType.trim(),
        amenities: hotelAmenities.split(",").map((s) => s.trim()).filter(Boolean),
        price: Number(hotelPrice),
        description: hotelDescription.trim(),
        images: hotelImages,
      };
    } else if (formType === "sightseeing") {
      if (!sightName.trim()) {
        toast.error("Sightseeing Name is required");
        return;
      }
      dataObj = {
        name: sightName.trim(),
        location: sightLocation.trim(),
        duration: sightDuration.trim(),
        description: sightDescription.trim(),
        images: sightImages,
      };
    } else if (formType === "itinerary") {
      if (!itinTitle.trim() || !itinDescription.trim()) {
        toast.error("Itinerary Title and Description are required");
        return;
      }
      dataObj = {
        title: itinTitle.trim(),
        city: itinCity.trim(),
        hotelName: itinHotelName.trim(),
        description: itinDescription.trim(),
      };
    }

    setSubmitting(true);
    try {
      const payload = {
        destination: formDestination.trim(),
        city: formCity.trim(),
        type: formType,
        data: dataObj,
      };

      if (editingPreset) {
        await api.put(`/presets/${editingPreset._id}`, payload);
        toast.success("Preset updated successfully");
      } else {
        await api.post("/presets", payload);
        toast.success("Preset created successfully");
      }

      setIsCreateModalOpen(false);
      resetForm();
      fetchPresets();
      fetchDestinations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save preset");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Destination Presets</h1>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Preset
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
          {/* Destination Selector */}
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter by Destination (e.g. Goa, Manali)..."
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Search Query */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by preset name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg self-stretch md:self-auto justify-center">
          <button
            onClick={() => setSelectedType("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              selectedType === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedType("hotel")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
              selectedType === "hotel" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Hotel className="w-3.5 h-3.5" />
            Hotels
          </button>
          <button
            onClick={() => setSelectedType("sightseeing")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
              selectedType === "sightseeing" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Sightseeing
          </button>
          <button
            onClick={() => setSelectedType("itinerary")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
              selectedType === "itinerary" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Itineraries
          </button>
        </div>
      </div>

      {/* Quick Destination Pills */}
      {destinationsList.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-muted-foreground font-medium">Quick Destinations:</span>
          <button
            onClick={() => setSelectedDestination("")}
            className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
              !selectedDestination ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-muted text-foreground"
            }`}
          >
            All Destinations ({presets.length})
          </button>
          {destinationsList.map((dest) => (
            <button
              key={dest}
              onClick={() => setSelectedDestination(dest)}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                selectedDestination.toLowerCase() === dest.toLowerCase()
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border hover:bg-muted text-foreground"
              }`}
            >
              {dest}
            </button>
          ))}
        </div>
      )}

      {/* Presets Grid */}
      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Loading presets...</div>
      ) : presets.length === 0 ? (
        <div className="py-20 text-center bg-card rounded-xl border border-border space-y-3">
          <Bookmark className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-foreground">No Presets Found</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            No presets match your selected destination or category filter. Click "Add New Preset" to create one.
          </p>
          <Button onClick={openCreateModal} variant="outline" className="mt-2">
            <Plus className="w-4 h-4 mr-2" />
            Create First Preset
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {presets.map((preset) => {
            if (preset.type === "hotel") {
              const h = preset.data as PresetHotelData;
              const coverImg = h.images?.[0]?.url;

              return (
                <div key={preset._id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="relative h-44 bg-muted">
                    {coverImg ? (
                      <Image src={coverImg} alt={h.hotelName} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                        <Hotel className="w-12 h-12" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow flex items-center gap-1">
                      <Hotel className="w-3.5 h-3.5" />
                      Hotel Preset
                    </span>
                    <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-md">
                      {preset.destination}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg text-foreground truncate">{h.hotelName}</h3>
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {h.starRating || 3}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {h.location || preset.destination}
                      </p>

                      {h.roomType && (
                        <p className="text-xs font-semibold text-foreground mt-2">Room Type: {h.roomType}</p>
                      )}

                      {h.amenities && h.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {h.amenities.slice(0, 4).map((a, idx) => (
                            <span key={idx} className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {h.images?.length || 0} pre-uploaded image(s)
                      </span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(preset)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeletePresetId(preset._id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (preset.type === "sightseeing") {
              const s = preset.data as PresetSightseeingData;
              const coverImg = s.images?.[0]?.url;

              return (
                <div key={preset._id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="relative h-44 bg-muted">
                    {coverImg ? (
                      <Image src={coverImg} alt={s.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                        <Camera className="w-12 h-12" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-sky-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" />
                      Sightseeing Preset
                    </span>
                    <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-md">
                      {preset.destination}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-foreground truncate">{s.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {s.location || preset.destination}
                        {s.duration && (
                          <span className="flex items-center gap-1 ml-2">
                            <Clock className="w-3 h-3" />
                            {s.duration}
                          </span>
                        )}
                      </p>
                      {s.description && (
                        <p className="text-xs text-muted-foreground line-clamp-3 mt-2">{s.description}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {s.images?.length || 0} pre-uploaded image(s)
                      </span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(preset)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeletePresetId(preset._id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (preset.type === "itinerary") {
              const i = preset.data as PresetItineraryData;

              return (
                <div key={preset._id} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="bg-purple-500/10 text-purple-600 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        Itinerary Preset
                      </span>
                      <span className="bg-muted text-foreground text-xs font-medium px-2.5 py-1 rounded-md">
                        {preset.destination}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-foreground mt-3">{i.title}</h3>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-4 leading-relaxed">{i.description}</p>

                    {i.hotelName && (
                      <p className="text-xs text-amber-600 font-semibold mt-3 bg-amber-500/10 px-2.5 py-1 rounded w-fit">
                        Recommended Hotel: {i.hotelName}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">City: {i.city || preset.destination}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(preset)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletePresetId(preset._id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}

      {/* Create / Edit Preset Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-lg text-foreground">
                  {editingPreset ? "Edit Destination Preset" : "Create New Destination Preset"}
                </h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsCreateModalOpen(false)} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Destination & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Destination Tag *</label>
                  <Input
                    placeholder="e.g. Goa, Manali, Bali, Kerala"
                    value={formDestination}
                    onChange={(e) => setFormDestination(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Preset Type *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as PresetType)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={!!editingPreset}
                  >
                    <option value="hotel">Hotel Preset</option>
                    <option value="sightseeing">Sightseeing Preset</option>
                    <option value="itinerary">Itinerary Day Preset</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Fields for Hotel */}
              {formType === "hotel" && (
                <div className="space-y-4 pt-2 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">Hotel Name *</label>
                      <Input
                        placeholder="e.g. Taj Exotica Resort & Spa"
                        value={hotelName}
                        onChange={(e) => setHotelName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">Location / City</label>
                      <Input
                        placeholder="e.g. Benaulim, South Goa"
                        value={hotelLocation}
                        onChange={(e) => setHotelLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">Star Rating (1-7)</label>
                      <Input
                        type="number"
                        min="1"
                        max="7"
                        value={hotelStarRating}
                        onChange={(e) => setHotelStarRating(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">Room Type</label>
                      <Input
                        placeholder="e.g. Deluxe Ocean View Suite"
                        value={hotelRoomType}
                        onChange={(e) => setHotelRoomType(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">Est. Price per Night</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={hotelPrice}
                        onChange={(e) => setHotelPrice(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Amenities (comma-separated)</label>
                    <Input
                      placeholder="e.g. Swimming Pool, Free WiFi, Spa, Breakfast Included"
                      value={hotelAmenities}
                      onChange={(e) => setHotelAmenities(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Description</label>
                    <Textarea
                      placeholder="Hotel features and details..."
                      value={hotelDescription}
                      onChange={(e) => setHotelDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Pre-uploaded Images */}
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Pre-Uploaded Hotel Images</label>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {hotelImages.map((img, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border border-border group">
                          <Image src={img.url} alt="Hotel" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => setHotelImages((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary/50 p-4 rounded-lg cursor-pointer bg-muted/30 transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">
                        {uploading ? "Uploading images to CDN..." : "Upload Hotel Images"}
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={uploading}
                        onChange={(e) => handleImageUpload(e, "hotel")}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Dynamic Fields for Sightseeing */}
              {formType === "sightseeing" && (
                <div className="space-y-4 pt-2 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">Sightseeing Title / Spot *</label>
                      <Input
                        placeholder="e.g. Dudhsagar Waterfalls Trek & Jeep Safari"
                        value={sightName}
                        onChange={(e) => setSightName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">Duration</label>
                      <Input
                        placeholder="e.g. 4 Hours / Half Day"
                        value={sightDuration}
                        onChange={(e) => setSightDuration(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Location</label>
                    <Input
                      placeholder="e.g. Bhagwan Mahaveer Sanctuary, Goa"
                      value={sightLocation}
                      onChange={(e) => setSightLocation(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Description</label>
                    <Textarea
                      placeholder="Highlights and itinerary summary..."
                      value={sightDescription}
                      onChange={(e) => setSightDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Pre-uploaded Images */}
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Pre-Uploaded Sightseeing Images</label>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {sightImages.map((img, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border border-border group">
                          <Image src={img.url} alt="Sightseeing" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => setSightImages((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary/50 p-4 rounded-lg cursor-pointer bg-muted/30 transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">
                        {uploading ? "Uploading images to CDN..." : "Upload Sightseeing Images"}
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={uploading}
                        onChange={(e) => handleImageUpload(e, "sightseeing")}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Dynamic Fields for Itinerary */}
              {formType === "itinerary" && (
                <div className="space-y-4 pt-2 border-t border-border">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Itinerary Day Title *</label>
                    <Input
                      placeholder="e.g. Arrival in Goa & North Goa Beach Hopping"
                      value={itinTitle}
                      onChange={(e) => setItinTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">City</label>
                      <Input
                        placeholder="e.g. Calangute, North Goa"
                        value={itinCity}
                        onChange={(e) => setItinCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground mb-1 block">Recommended Hotel Name</label>
                      <Input
                        placeholder="e.g. Hard Rock Hotel Goa"
                        value={itinHotelName}
                        onChange={(e) => setItinHotelName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Full Day Description *</label>
                    <Textarea
                      placeholder="Detailed schedule and activities for this day..."
                      value={itinDescription}
                      onChange={(e) => setItinDescription(e.target.value)}
                      rows={5}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Modal Submit */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || uploading}>
                  {submitting ? "Saving..." : editingPreset ? "Update Preset" : "Create Preset"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletePresetId && (
        <ConfirmDelete
          isOpen={!!deletePresetId}
          onClose={() => setDeletePresetId(null)}
          onConfirm={handleDeletePreset}
          title="Delete Destination Preset"
          message="Are you sure you want to delete this preset template? This action cannot be undone."
        />
      )}
    </div>
  );
}

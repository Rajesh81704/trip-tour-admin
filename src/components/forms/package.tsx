"use client";
import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import {
  Plus, X, Upload, Plane, Hotel, Camera,
  ChevronDown, ChevronUp, MapPin, Clock,
  Star, Utensils, Eye, BedDouble, Calculator, Sparkles, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Package, FlightOption, HotelOption, SightseeingOption, PACKAGE_CATEGORIES } from "@/types/package";
import { uploadFilesToR2 } from "@/lib/r2-upload";

// ─── Zod schemas ──────────────────────────────────────────────────────────────
const flightSchema = z.object({
  type: z.enum(["main", "internal"]),
  airline: z.string().min(1, "Required"),
  flightNumber: z.string().min(1, "Required"),
  departureCity: z.string().min(1, "Required"),
  departureAirport: z.string().min(1, "Required"),
  departureTime: z.string().min(1, "Required"),
  departureDate: z.string().min(1, "Required"),
  arrivalCity: z.string().min(1, "Required"),
  arrivalAirport: z.string().min(1, "Required"),
  arrivalTime: z.string().min(1, "Required"),
  arrivalDate: z.string().min(1, "Required"),
  duration: z.string().min(1, "Required"),
  class: z.enum(["economy", "business", "first"]).or(z.string()),
  price: z.number().min(0),
  description: z.string().optional(),
  image: z.object({ url: z.string(), public_id: z.string() }).optional(),
  _id: z.string().optional(),
});

const hotelSchema = z.object({
  location: z.string().min(1, "Required"),
  hotelName: z.string().min(1, "Required"),
  nights: z.number().min(1),
  roomType: z.string().min(1, "Required"),
  amenities: z.array(z.string()).optional(),
  price: z.number().min(0),
  starRating: z.number().min(1).max(5).optional().nullable(),
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.object({ url: z.string(), public_id: z.string() })).optional(),
  image: z.object({ url: z.string(), public_id: z.string() }).optional(),
  _id: z.string().optional(),
});

const sightseeingSchema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().optional(),
  location: z.string().optional(),
  duration: z.string().optional(),
  images: z.array(z.object({ url: z.string(), public_id: z.string() })).optional(),
  _id: z.string().optional(),
});

const packageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.object({
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    destination: z.string().min(1, "Destination is required"),
  }),
  duration: z.object({
    day: z.number().min(1, "At least 1 day"),
    night: z.number().min(0),
  }),
  price: z.number().min(0, "Price required"),
  discount: z.number().min(0).max(100),
  features: z.array(z.string().min(1)).min(1, "At least one feature"),
  highlights: z.array(z.string().min(1)).min(1, "At least one highlight"),
  itinerary: z.array(z.object({
    day: z.number(),
    title: z.string().min(1, "Title required"),
    description: z.string().min(1, "Description required"),
    hotelName: z.string().optional(),
    city: z.string().min(1, "City is mandatory"),
    _id: z.string().optional(),
  })).min(1, "At least one day"),
  inclusions: z.array(z.string().min(1)).min(1, "At least one inclusion"),
  exclusions: z.array(z.string().min(1)).min(1, "At least one exclusion"),
  category: z.string().min(1, "Category is required"),
  flights: z.array(flightSchema).optional(),
  hotels: z.array(hotelSchema).optional(),
  sightseeings: z.array(sightseeingSchema).optional(),
});

type PackageFormValues = z.infer<typeof packageSchema>;

// ─── Small UI helpers ─────────────────────────────────────────────────────────
function SectionHeader({
  icon, title, badge, open, onToggle,
}: { icon: React.ReactNode; title: string; badge?: number; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between bg-muted/60 border-b border-border px-4 py-3 hover:bg-muted transition-colors"
    >
      <div className="flex items-center gap-2 font-semibold text-foreground">
        {icon}
        {title}
        {badge !== undefined && badge > 0 && (
          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>
        )}
      </div>
      {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
    </button>
  );
}

function FieldLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-xs font-semibold uppercase tracking-wide mb-1.5 ${className ?? "text-muted-foreground"}`}>{children}</label>;
}

function UploadProgressBar({ pct }: { pct: number }) {
  if (pct <= 0 || pct >= 100) return null;
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
      <div
        className="bg-blue-500 h-1.5 rounded-full transition-all duration-200"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function MultiImageUpload({
  label, fieldId, existingImages, newPreviews,
  onAdd, onRemoveExisting, onRemoveNew, uploadProgress,
}: {
  label: string; fieldId: string;
  existingImages: { url: string; public_id: string }[];
  newPreviews: string[];
  onAdd: (files: File[]) => void;
  onRemoveExisting: (idx: number) => void;
  onRemoveNew: (idx: number) => void;
  uploadProgress?: number;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex flex-wrap gap-2 mb-2">
        {existingImages.map((img, i) => (
          <div key={i} className="relative w-20 h-20">
            <Image src={img.url} alt="" fill className="rounded-lg object-cover" />
            <button type="button" onClick={() => onRemoveExisting(i)}
              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {newPreviews.map((src, i) => (
          <div key={`new-${i}`} className="relative w-20 h-20">
            <Image src={src} alt="" fill className="rounded-lg object-cover" />
            <button type="button" onClick={() => onRemoveNew(i)}
              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <label htmlFor={fieldId}
          className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <Upload className="w-4 h-4 text-gray-400 mb-1" />
          <span className="text-[10px] text-gray-400">Add</span>
          <input id={fieldId} type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => e.target.files && onAdd(Array.from(e.target.files))} />
        </label>
      </div>
      <UploadProgressBar pct={uploadProgress ?? 0} />
    </div>
  );
}

const selectClassName =
  "w-full border border-input rounded-lg px-3 py-2 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring";
interface PackageFormProps {
  initialData?: Package;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: Record<string, any>) => Promise<void>;
}

export default function PackageForm({ initialData, onSubmit }: PackageFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  // Section collapse state
  const [openSections, setOpenSections] = useState({
    basic: true, location: true, pricing: true,
    features: false, itinerary: false, inclusions: false,
    flights: false, hotels: false, sightseeings: false, images: true,
  });
  const toggle = (s: keyof typeof openSections) =>
    setOpenSections((p) => ({ ...p, [s]: !p[s] }));

  // ── Package images ────────────────────────────────────────────────────────
  const [pkgImageFiles, setPkgImageFiles] = useState<File[]>([]);
  const [pkgImagePreviews, setPkgImagePreviews] = useState<string[]>(
    initialData?.images.map((i) => i.url) ?? []
  );
  const [existingPkgImages, setExistingPkgImages] = useState(initialData?.images ?? []);

  const onPkgDrop = useCallback((files: File[]) => {
    setPkgImageFiles((p) => [...p, ...files]);
    setPkgImagePreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onPkgDrop, accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
  });

  // ── Hotel images (per hotel, multiple) ───────────────────────────────────
  const [hotelImageFiles, setHotelImageFiles] = useState<{ [hi: number]: File[] }>({});
  const [hotelImagePreviews, setHotelImagePreviews] = useState<{ [hi: number]: string[] }>({});

  // ── Sightseeing images (per sightseeing, multiple) ────────────────────────
  const [sightseeingImageFiles, setSightseeingImageFiles] = useState<{ [si: number]: File[] }>({});
  const [sightseeingImagePreviews, setSightseeingImagePreviews] = useState<{ [si: number]: string[] }>({});

  // ── Form ──────────────────────────────────────────────────────────────────
  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          itinerary: initialData.itinerary.map((d) => ({
            ...d, hotelName: d.hotelName ?? "", city: d.city ?? "",
          })),
          flights:     initialData.flights     ?? [],
          hotels:      initialData.hotels      ?? [],
          sightseeings:initialData.sightseeings?? [],
        }
      : {
          title: "", description: "",
          location: { city: "", state: "", destination: "" },
          duration: { day: 1, night: 0 },
          price: 0, discount: 0,
          features: [""], highlights: [""],
          itinerary: [{ day: 1, title: "", description: "", hotelName: "", city: "" }],
          inclusions: [""], exclusions: [""],
          category: "", flights: [], hotels: [], sightseeings: [],
        },
  });

  const { watch, setValue, getValues } = form;
  const durationDay   = watch("duration.day");

  // ── Auto-generate itinerary days when duration.day changes ───────────────
  useEffect(() => {
    const days = Math.max(1, durationDay || 1);
    const current = getValues("itinerary");
    const defaultCity = getValues("location.city") || "";
    if (current.length === days) return;
    if (days > current.length) {
      const extras = Array.from({ length: days - current.length }, (_, i) => ({
        day: current.length + i + 1, title: "", description: "", hotelName: "", city: defaultCity,
      }));
      setValue("itinerary", [...current, ...extras]);
    } else {
      setValue("itinerary", current.slice(0, days));
    }
  }, [durationDay]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync nights = days - 1 when days change ───────────────────────────────
  useEffect(() => {
    const days = Math.max(1, durationDay || 1);
    if (!initialData) setValue("duration.night", Math.max(0, days - 1));
  }, [durationDay]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Dynamic list helpers ──────────────────────────────────────────────────
  function addToList(field: "features" | "highlights" | "inclusions" | "exclusions") {
    const cur = getValues(field) as string[];
    setValue(field, [...cur, ""]);
  }
  function updateList(field: "features" | "highlights" | "inclusions" | "exclusions", idx: number, val: string) {
    const cur = [...(getValues(field) as string[])];
    cur[idx] = val;
    setValue(field, cur);
  }
  function removeFromList(field: "features" | "highlights" | "inclusions" | "exclusions", idx: number) {
    const cur = (getValues(field) as string[]).filter((_, i) => i !== idx);
    setValue(field, cur.length ? cur : [""]);
  }

  // ── Submit — uploads files to R2 first, then sends JSON to backend ────────
  const handleSubmit = async (values: PackageFormValues) => {
    try {
      setIsSubmitting(true);

      // ── 1. Upload package images ─────────────────────────────────────────
      let finalPkgImages = [...existingPkgImages];
      if (pkgImageFiles.length > 0) {
        setUploadStatus(`Uploading package images (0/${pkgImageFiles.length})…`);
        toast.info(`Uploading ${pkgImageFiles.length} package image(s)…`);
        const uploaded = await uploadFilesToR2(
          pkgImageFiles,
          "packages",
          (curr, total) => setUploadStatus(`Uploading package images (${curr}/${total})…`)
        );
        const newImages = uploaded.map(({ key, publicUrl }) => ({ url: publicUrl, public_id: key }));
        finalPkgImages = [...finalPkgImages, ...newImages];
      }
      if (finalPkgImages.length === 0 && !initialData) {
        toast.error("Please upload at least one package image.");
        return;
      }

      // ── 2. Upload hotel images ───────────────────────────────────────────
      const updatedHotels = [...(values.hotels ?? [])];
      for (const [hiStr, files] of Object.entries(hotelImageFiles)) {
        const hi = Number(hiStr);
        if (!files.length) continue;
        setUploadStatus(`Uploading hotel ${hi + 1} images (0/${files.length})…`);
        toast.info(`Uploading hotel ${hi + 1} image(s)…`);
        const uploaded = await uploadFilesToR2(
          files,
          "hotels",
          (curr, total) => setUploadStatus(`Uploading hotel ${hi + 1} images (${curr}/${total})…`)
        );
        const newImgs = uploaded.map(({ key, publicUrl }) => ({ url: publicUrl, public_id: key }));
        updatedHotels[hi] = {
          ...updatedHotels[hi],
          images: [...(updatedHotels[hi]?.images ?? []), ...newImgs],
        };
      }

      // ── 3. Upload sightseeing images ─────────────────────────────────────
      const updatedSightseeings = [...(values.sightseeings ?? [])];
      for (const [siStr, files] of Object.entries(sightseeingImageFiles)) {
        const si = Number(siStr);
        if (!files.length) continue;
        setUploadStatus(`Uploading sightseeing ${si + 1} images (0/${files.length})…`);
        toast.info(`Uploading sightseeing ${si + 1} image(s)…`);
        const uploaded = await uploadFilesToR2(
          files,
          "sightseeings",
          (curr, total) => setUploadStatus(`Uploading sightseeing ${si + 1} images (${curr}/${total})…`)
        );
        const newImgs = uploaded.map(({ key, publicUrl }) => ({ url: publicUrl, public_id: key }));
        updatedSightseeings[si] = {
          ...updatedSightseeings[si],
          images: [...(updatedSightseeings[si]?.images ?? []), ...newImgs],
        };
      }

      setUploadStatus("Saving package details…");

      // ── 4. Send pure JSON to backend (no files) ──────────────────────────
      const payload = {
        title:        values.title,
        description:  values.description,
        price:        values.price,
        discount:     values.discount,
        category:     values.category,
        location:     values.location,
        duration:     values.duration,
        features:     values.features,
        highlights:   values.highlights,
        itinerary:    values.itinerary,
        inclusions:   values.inclusions,
        exclusions:   values.exclusions,
        flights:      values.flights ?? [],
        hotels:       updatedHotels,
        sightseeings: updatedSightseeings,
        images:       finalPkgImages,
      };

      // Direct client UI upload to R2 completed — pass clean JSON payload to onSubmit
      await onSubmit(payload);

      if (!initialData) {
        toast.success("Package created successfully");
        router.push("/packages");
      } else {
        toast.success("Package updated successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const itinerary   = watch("itinerary");
  const flights     = watch("flights") ?? [];
  const hotels      = watch("hotels") ?? [];
  const sightseeings= watch("sightseeings") ?? [];

  const flightsTotal = flights.reduce((acc, f) => acc + (Number(f.price) || 0), 0);
  const hotelsTotal = hotels.reduce((acc, h) => acc + ((Number(h.price) || 0) * (Number(h.nights) || 1)), 0);
  const calculatedTotal = flightsTotal + hotelsTotal;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit, (errs) => {
        console.error("PackageForm Validation Errors:", errs);
        const keys = Object.keys(errs);
        toast.error(`Please fix validation errors in: ${keys.join(", ")}`);
      })}
        className="space-y-4 max-w-4xl">

        {/* ── 1. BASIC INFO ────────────────────────────────────────────────── */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl overflow-hidden shadow-sm">
          <SectionHeader icon={<Eye className="w-4 h-4" />} title="Basic Information"
            open={openSections.basic} onToggle={() => toggle("basic")} />
          {openSections.basic && (
            <div className="p-5 space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Title *</FormLabel>
                  <FormControl><Input placeholder="e.g. Explore Vietnam 8N / 9D" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl><Textarea rows={4} placeholder="Describe this package..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <FormControl>
                    <select {...field} className={selectClassName}>
                      <option value="">— Select category —</option>
                      {PACKAGE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          )}
        </div>

        {/* ── 2. LOCATION ──────────────────────────────────────────────────── */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl overflow-hidden shadow-sm">
          <SectionHeader icon={<MapPin className="w-4 h-4" />} title="Location"
            open={openSections.location} onToggle={() => toggle("location")} />
          {openSections.location && (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(["location.city", "location.state", "location.destination"] as const).map((name, i) => (
                <FormField key={name} control={form.control} name={name} render={({ field }) => (
                  <FormItem>
                    <FormLabel>{["City *", "State *", "Destination *"][i]}</FormLabel>
                    <FormControl><Input placeholder={["Mumbai", "Maharashtra", "Vietnam"][i]} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              ))}
            </div>
          )}
        </div>

        {/* ── 3. DURATION & PRICING ────────────────────────────────────────── */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl overflow-hidden shadow-sm">
          <SectionHeader icon={<Clock className="w-4 h-4" />} title="Duration & Pricing"
            open={openSections.pricing} onToggle={() => toggle("pricing")} />
          {openSections.pricing && (
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <FormField control={form.control} name="duration.day" render={({ field }) => (
                <FormItem>
                  <FormLabel>Days *</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="duration.night" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nights</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Package Price (₹) *</FormLabel>
                    {calculatedTotal > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setValue("price", calculatedTotal);
                          toast.success(`Package price updated to ₹${calculatedTotal.toLocaleString("en-IN")}`);
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" /> Auto-fill (₹{calculatedTotal.toLocaleString("en-IN")})
                      </button>
                    )}
                  </div>
                  <FormControl>
                    <Input type="number" min={0} {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="discount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount (%)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={100} {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* ── Included Flight & Hotel Price Summary Box ───────────────── */}
              {(flights.length > 0 || hotels.length > 0) && (
                <div className="sm:col-span-2 p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200">
                      <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Included Flight & Hotel Price Summary</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setValue("price", calculatedTotal);
                        toast.success(`Package price set to ₹${calculatedTotal.toLocaleString("en-IN")}`);
                      }}
                      className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Set Package Price to ₹{calculatedTotal.toLocaleString("en-IN")}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-background border border-border shadow-2xs">
                      <span className="text-muted-foreground block text-[10px] font-medium">Flights Total ({flights.length})</span>
                      <span className="font-bold text-foreground text-sm">₹{flightsTotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border border-border shadow-2xs">
                      <span className="text-muted-foreground block text-[10px] font-medium">Hotels Total ({hotels.length})</span>
                      <span className="font-bold text-foreground text-sm">₹{hotelsTotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/30 shadow-2xs">
                      <span className="text-primary block text-[10px] font-semibold">Combined Add-on Total</span>
                      <span className="font-black text-primary text-sm">₹{calculatedTotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 4. FEATURES & HIGHLIGHTS ─────────────────────────────────────── */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl overflow-hidden shadow-sm">
          <SectionHeader icon={<Star className="w-4 h-4" />} title="Features & Highlights"
            open={openSections.features} onToggle={() => toggle("features")} />
          {openSections.features && (
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              {(["features", "highlights"] as const).map((field) => {
                const values = watch(field) as string[];
                return (
                  <div key={field}>
                    <div className="flex items-center justify-between mb-2">
                      <FieldLabel>{field === "features" ? "Features" : "Highlights"}</FieldLabel>
                      <button type="button" onClick={() => addToList(field)}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {values.map((val, i) => (
                        <div key={i} className="flex gap-2">
                          <Input value={val} placeholder={`${field} item`}
                            onChange={(e) => updateList(field, i, e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToList(field); } }} />
                          <button type="button" onClick={() => removeFromList(field, i)}
                            className="text-red-400 hover:text-red-600 shrink-0"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 5. ITINERARY (auto-generated) ────────────────────────────────── */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl overflow-hidden shadow-sm">
          <SectionHeader icon={<MapPin className="w-4 h-4" />}
            title={`Itinerary (${durationDay || 1} Day${(durationDay || 1) > 1 ? "s" : ""})`}
            badge={itinerary.length} open={openSections.itinerary} onToggle={() => toggle("itinerary")} />
          {openSections.itinerary && (
            <div className="p-5">
              <p className="text-xs text-muted-foreground mb-4">
                Days auto-populate from your duration setting above. Fill title, description, hotel and city per day.
              </p>
              <div className="space-y-4">
                {itinerary.map((day, i) => (
                  <div key={i} className="border border-border rounded-xl p-4 bg-muted/30">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                        {day.day}
                      </span>
                      <span className="text-sm font-semibold text-foreground">Day {day.day}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <FieldLabel>Day Title *</FieldLabel>
                        <Input placeholder={`Day ${day.day} — e.g. Arrival in Hanoi`}
                          value={itinerary[i]?.title ?? ""}
                          onChange={(e) => {
                            const updated = [...itinerary];
                            updated[i] = { ...updated[i], title: e.target.value };
                            setValue("itinerary", updated);
                          }} />
                      </div>
                      <div className="sm:col-span-2">
                        <FieldLabel>Description *</FieldLabel>
                        <Textarea rows={3} placeholder="What happens on this day..."
                          value={itinerary[i]?.description ?? ""}
                          onChange={(e) => {
                            const updated = [...itinerary];
                            updated[i] = { ...updated[i], description: e.target.value };
                            setValue("itinerary", updated);
                          }} />
                      </div>
                      <div>
                        <FieldLabel>Hotel Name (optional)</FieldLabel>
                        <Input placeholder="e.g. Sunway Hotel Hanoi"
                          value={itinerary[i]?.hotelName ?? ""}
                          onChange={(e) => {
                            const updated = [...itinerary];
                            updated[i] = { ...updated[i], hotelName: e.target.value };
                            setValue("itinerary", updated);
                          }} />
                      </div>
                      <div>
                        <FieldLabel>City (optional)</FieldLabel>
                        <Input placeholder="e.g. Hanoi"
                          value={itinerary[i]?.city ?? ""}
                          onChange={(e) => {
                            const updated = [...itinerary];
                            updated[i] = { ...updated[i], city: e.target.value };
                            setValue("itinerary", updated);
                          }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── 6. INCLUSIONS & EXCLUSIONS ───────────────────────────────────── */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl overflow-hidden shadow-sm">
          <SectionHeader icon={<Utensils className="w-4 h-4" />} title="Inclusions & Exclusions"
            open={openSections.inclusions} onToggle={() => toggle("inclusions")} />
          {openSections.inclusions && (
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              {(["inclusions", "exclusions"] as const).map((field) => {
                const values = watch(field) as string[];
                const isInclusion = field === "inclusions";
                return (
                  <div key={field}>
                    <div className="flex items-center justify-between mb-2">
                      <FieldLabel className={isInclusion ? "text-green-600" : "text-red-500"}>
                        {isInclusion ? "✓ Inclusions" : "✗ Exclusions"}
                      </FieldLabel>
                      <button type="button" onClick={() => addToList(field)}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {values.map((val, i) => (
                        <div key={i} className="flex gap-2">
                          <Input value={val} placeholder={isInclusion ? "e.g. Hotel accommodation" : "e.g. Visa fees"}
                            onChange={(e) => updateList(field, i, e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addToList(field); } }} />
                          <button type="button" onClick={() => removeFromList(field, i)}
                            className="text-red-400 hover:text-red-600 shrink-0"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 7. FLIGHTS ───────────────────────────────────────────────────── */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl overflow-hidden shadow-sm">
          <SectionHeader icon={<Plane className="w-4 h-4 text-blue-500" />}
            title="Flights (Optional)" badge={flights.length}
            open={openSections.flights} onToggle={() => toggle("flights")} />
          {openSections.flights && (
            <div className="p-5 space-y-4">
              <button type="button" onClick={() => {
                const f: FlightOption = {
                  type: "main", airline: "", flightNumber: "", departureCity: "",
                  departureAirport: "", departureTime: "", departureDate: "",
                  arrivalCity: "", arrivalAirport: "", arrivalTime: "", arrivalDate: "",
                  duration: "", class: "economy", price: 0, description: "",
                };
                setValue("flights", [...flights, f]);
              }} className="flex items-center gap-2 text-sm font-semibold text-blue-600 border border-blue-200 bg-blue-50 rounded-lg px-4 py-2 hover:bg-blue-100 transition-colors">
                <Plus className="w-4 h-4" /> Add Flight
              </button>

              {flights.map((fl, fi) => (
                <div key={fi} className="border border-blue-100 rounded-xl bg-blue-50/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-700">
                      Flight {fi + 1} {fl.airline ? `— ${fl.airline}` : ""}
                    </span>
                    <button type="button" onClick={() => setValue("flights", flights.filter((_, i) => i !== fi), { shouldDirty: true, shouldTouch: true })}
                      className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {([
                      ["Type", "type", "select", ["main:Main Flight (International)", "internal:Internal Flight (Domestic)"]],
                      ["Class", "class", "select", ["economy:Economy", "business:Business", "first:First Class"]],
                      ["Airline", "airline", "text", null, "e.g. VietJet Air"],
                      ["Flight No.", "flightNumber", "text", null, "e.g. VJ 1806"],
                      ["Departure City", "departureCity", "text", null, "e.g. Ahmedabad, IN"],
                      ["Dep. Airport (Code)", "departureAirport", "text", null, "e.g. AMD"],
                      ["Dep. Date", "departureDate", "date", null],
                      ["Dep. Time", "departureTime", "time", null],
                      ["Arrival City", "arrivalCity", "text", null, "e.g. Ho Chi Minh, VN"],
                      ["Arr. Airport (Code)", "arrivalAirport", "text", null, "e.g. SGN"],
                      ["Arr. Date", "arrivalDate", "date", null],
                      ["Arr. Time", "arrivalTime", "time", null],
                      ["Duration", "duration", "text", null, "e.g. 9h 20m"],
                      ["Price (₹)", "price", "number", null],
                    ] as [string, string, string, string[] | null, string?][]).map(([label, key, type, opts, ph]) => {
                      const rawVal = (fl as Record<string, unknown>)[key];
                      const displayVal = rawVal !== undefined && rawVal !== null ? String(rawVal) : (type === "select" ? (opts![0]?.split(":")[0] ?? "") : "");
                      return (
                        <div key={key} className={key === "airline" || key === "departureCity" || key === "arrivalCity" ? "col-span-2 sm:col-span-1" : ""}>
                          <FieldLabel>{label}</FieldLabel>
                          {type === "select" ? (
                            <select
                              value={displayVal}
                              onChange={(e) => {
                                const upd = [...flights];
                                upd[fi] = { ...upd[fi], [key]: e.target.value };
                                setValue("flights", upd, { shouldDirty: true, shouldTouch: true });
                              }}
                              className={selectClassName}>
                              {opts!.map((o) => { const [v, l] = o.split(":"); return <option key={v} value={v}>{l}</option>; })}
                            </select>
                          ) : (
                            <Input
                              type={type}
                              placeholder={ph}
                              value={displayVal}
                              onChange={(e) => {
                                const upd = [...flights];
                                const inputVal = e.target.value;
                                const parsedVal = type === "number" ? (inputVal === "" ? "" : parseFloat(inputVal) || 0) : inputVal;
                                upd[fi] = { ...upd[fi], [key]: parsedVal };
                                setValue("flights", upd, { shouldDirty: true, shouldTouch: true });
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                    <div className="col-span-2 sm:col-span-3">
                      <FieldLabel>Notes / Description</FieldLabel>
                      <Textarea rows={2} placeholder="Optional notes about this flight"
                        value={fl.description ?? ""}
                        onChange={(e) => {
                          const upd = [...flights];
                          upd[fi] = { ...upd[fi], description: e.target.value };
                          setValue("flights", upd, { shouldDirty: true, shouldTouch: true });
                        }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 8. HOTELS ────────────────────────────────────────────────────── */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl overflow-hidden shadow-sm">
          <SectionHeader icon={<Hotel className="w-4 h-4 text-green-600" />}
            title="Hotels (Optional)" badge={hotels.length}
            open={openSections.hotels} onToggle={() => toggle("hotels")} />
          {openSections.hotels && (
            <div className="p-5 space-y-4">
              <button type="button" onClick={() => {
                const h: HotelOption = {
                  location: "", hotelName: "", nights: 1, roomType: "",
                  amenities: [], price: 0, starRating: 3, description: "", images: [],
                };
                setValue("hotels", [...hotels, h], { shouldDirty: true, shouldTouch: true });
              }} className="flex items-center gap-2 text-sm font-semibold text-green-700 border border-green-200 bg-green-50 rounded-lg px-4 py-2 hover:bg-green-100 transition-colors">
                <Plus className="w-4 h-4" /> Add Hotel
              </button>

              {hotels.map((ht, hi) => (
                <div key={hi} className="border border-green-100 rounded-xl bg-green-50/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-green-700">
                      Hotel {hi + 1} {ht.hotelName ? `— ${ht.hotelName}` : ""}
                    </span>
                    <button type="button" onClick={() => setValue("hotels", hotels.filter((_, i) => i !== hi), { shouldDirty: true, shouldTouch: true })}
                      className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {([
                      ["Hotel Name *", "hotelName", "text", "e.g. Sunway Hotel Hanoi"],
                      ["Location / City *", "location", "text", "e.g. Hanoi"],
                      ["Room Type *", "roomType", "text", "e.g. Deluxe Room"],
                      ["Nights *", "nights", "number", ""],
                      ["Price / Night (₹) *", "price", "number", ""],
                      ["Check-in Date", "checkInDate", "date", ""],
                      ["Check-out Date", "checkOutDate", "date", ""],
                    ] as [string, string, string, string][]).map(([label, key, type, ph]) => {
                      const rawVal = (ht as Record<string, unknown>)[key];
                      const displayVal = rawVal !== undefined && rawVal !== null ? String(rawVal) : "";
                      return (
                        <div key={key}>
                          <FieldLabel>{label}</FieldLabel>
                          <Input
                            type={type}
                            placeholder={ph}
                            value={displayVal}
                            onChange={(e) => {
                              const upd = [...hotels];
                              const inputVal = e.target.value;
                              const parsedVal = type === "number" ? (inputVal === "" ? "" : parseFloat(inputVal) || 0) : inputVal;
                              upd[hi] = { ...upd[hi], [key]: parsedVal };
                              setValue("hotels", upd, { shouldDirty: true, shouldTouch: true });
                            }}
                          />
                        </div>
                      );
                    })}
                    <div>
                      <FieldLabel>Star Rating</FieldLabel>
                      <select value={ht.starRating ?? 3}
                        onChange={(e) => {
                          const upd = [...hotels];
                          upd[hi] = { ...upd[hi], starRating: parseInt(e.target.value) || 3 };
                          setValue("hotels", upd, { shouldDirty: true, shouldTouch: true });
                        }}
                        className={selectClassName}>
                        {[1,2,3,4,5].map((n) => <option key={n} value={n}>{"★".repeat(n)} {n} Star{n>1?"s":""}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <FieldLabel>Amenities (comma-separated)</FieldLabel>
                      <Input placeholder="WiFi, AC, Pool, Gym, Breakfast"
                        value={ht.amenities?.join(", ") ?? ""}
                        onChange={(e) => {
                          const upd = [...hotels];
                          upd[hi] = { ...upd[hi], amenities: e.target.value.split(",").map((a) => a.trim()).filter(Boolean) };
                          setValue("hotels", upd, { shouldDirty: true, shouldTouch: true });
                        }} />
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <FieldLabel>Description</FieldLabel>
                      <Textarea rows={2} placeholder="Optional hotel details"
                        value={ht.description ?? ""}
                        onChange={(e) => {
                          const upd = [...hotels];
                          upd[hi] = { ...upd[hi], description: e.target.value };
                          setValue("hotels", upd, { shouldDirty: true, shouldTouch: true });
                        }} />
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <MultiImageUpload
                        label="Hotel Photos (up to 6)"
                        fieldId={`hotel-img-${hi}`}
                        existingImages={ht.images ?? (ht.image ? [ht.image] : [])}
                        newPreviews={hotelImagePreviews[hi] ?? []}
                        onAdd={(files) => {
                          setHotelImageFiles((p) => ({ ...p, [hi]: [...(p[hi] ?? []), ...files] }));
                          setHotelImagePreviews((p) => ({ ...p, [hi]: [...(p[hi] ?? []), ...files.map((f) => URL.createObjectURL(f))] }));
                        }}
                        onRemoveExisting={(idx) => {
                          const upd = [...hotels];
                          upd[hi].images = (upd[hi].images ?? []).filter((_, i) => i !== idx);
                          setValue("hotels", upd);
                        }}
                        onRemoveNew={(idx) => {
                          setHotelImageFiles((p) => { const n = { ...p }; n[hi] = (n[hi] ?? []).filter((_, i) => i !== idx); return n; });
                          setHotelImagePreviews((p) => { const n = { ...p }; n[hi] = (n[hi] ?? []).filter((_, i) => i !== idx); return n; });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 9. SIGHTSEEINGS ──────────────────────────────────────────────── */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl overflow-hidden shadow-sm">
          <SectionHeader icon={<Camera className="w-4 h-4 text-purple-600" />}
            title="Sightseeings (Optional)" badge={sightseeings.length}
            open={openSections.sightseeings} onToggle={() => toggle("sightseeings")} />
          {openSections.sightseeings && (
            <div className="p-5 space-y-4">
              <button type="button" onClick={() => {
                const s: SightseeingOption = { name: "", description: "", location: "", duration: "", images: [] };
                setValue("sightseeings", [...sightseeings, s], { shouldDirty: true, shouldTouch: true });
              }} className="flex items-center gap-2 text-sm font-semibold text-purple-700 border border-purple-200 bg-purple-50 rounded-lg px-4 py-2 hover:bg-purple-100 transition-colors">
                <Plus className="w-4 h-4" /> Add Sightseeing
              </button>

              {sightseeings.map((sg, si) => (
                <div key={si} className="border border-purple-100 rounded-xl bg-purple-50/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-purple-700">
                      {si + 1}. {sg.name || "New Sightseeing"}
                    </span>
                    <button type="button" onClick={() => setValue("sightseeings", sightseeings.filter((_, i) => i !== si), { shouldDirty: true, shouldTouch: true })}
                      className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <FieldLabel>Sightseeing Name *</FieldLabel>
                      <Input placeholder="e.g. Halong Bay Cruise"
                        value={sg.name ?? ""}
                        onChange={(e) => { const upd = [...sightseeings]; upd[si] = { ...upd[si], name: e.target.value }; setValue("sightseeings", upd, { shouldDirty: true, shouldTouch: true }); }} />
                    </div>
                    <div>
                      <FieldLabel>Location</FieldLabel>
                      <Input placeholder="e.g. Quảng Ninh, Vietnam"
                        value={sg.location ?? ""}
                        onChange={(e) => { const upd = [...sightseeings]; upd[si] = { ...upd[si], location: e.target.value }; setValue("sightseeings", upd, { shouldDirty: true, shouldTouch: true }); }} />
                    </div>
                    <div>
                      <FieldLabel>Duration</FieldLabel>
                      <Input placeholder="e.g. Half Day / 3 Hours"
                        value={sg.duration ?? ""}
                        onChange={(e) => { const upd = [...sightseeings]; upd[si] = { ...upd[si], duration: e.target.value }; setValue("sightseeings", upd, { shouldDirty: true, shouldTouch: true }); }} />
                    </div>
                    <div className="sm:col-span-2">
                      <FieldLabel>Description</FieldLabel>
                      <Textarea rows={2} placeholder="Tell travellers about this sightseeing..."
                        value={sg.description ?? ""}
                        onChange={(e) => { const upd = [...sightseeings]; upd[si] = { ...upd[si], description: e.target.value }; setValue("sightseeings", upd, { shouldDirty: true, shouldTouch: true }); }} />
                    </div>
                    <div className="sm:col-span-2">
                      <MultiImageUpload
                        label="Sightseeing Photos (up to 6)"
                        fieldId={`sightseeing-img-${si}`}
                        existingImages={sg.images ?? []}
                        newPreviews={sightseeingImagePreviews[si] ?? []}
                        onAdd={(files) => {
                          setSightseeingImageFiles((p) => ({ ...p, [si]: [...(p[si] ?? []), ...files] }));
                          setSightseeingImagePreviews((p) => ({ ...p, [si]: [...(p[si] ?? []), ...files.map((f) => URL.createObjectURL(f))] }));
                        }}
                        onRemoveExisting={(idx) => {
                          const upd = [...sightseeings]; upd[si] = { ...upd[si], images: (upd[si].images ?? []).filter((_, i) => i !== idx) }; setValue("sightseeings", upd);
                        }}
                        onRemoveNew={(idx) => {
                          setSightseeingImageFiles((p) => { const n = { ...p }; n[si] = (n[si] ?? []).filter((_, i) => i !== idx); return n; });
                          setSightseeingImagePreviews((p) => { const n = { ...p }; n[si] = (n[si] ?? []).filter((_, i) => i !== idx); return n; });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 10. PACKAGE IMAGES ───────────────────────────────────────────── */}
        <div className="bg-card text-card-foreground border border-border rounded-2xl overflow-hidden shadow-sm">
          <SectionHeader icon={<BedDouble className="w-4 h-4" />}
            title={`Package Photos (${existingPkgImages.length + pkgImageFiles.length} uploaded)`}
            open={openSections.images} onToggle={() => toggle("images")} />
          {openSections.images && (
            <div className="p-5 space-y-4">
              {/* Existing images */}
              {existingPkgImages.length > 0 && (
                <div>
                  <FieldLabel>Current Photos</FieldLabel>
                  <div className="flex flex-wrap gap-3">
                    {existingPkgImages.map((img, i) => (
                      <div key={i} className="relative w-24 h-24">
                        <Image src={img.url} alt="" fill className="rounded-xl object-cover" />
                        <button type="button"
                          onClick={() => setExistingPkgImages((p) => p.filter((_, j) => j !== i))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New uploads */}
              {pkgImagePreviews.length > existingPkgImages.length && (
                <div>
                  <FieldLabel>New Photos</FieldLabel>
                  <div className="flex flex-wrap gap-3">
                    {pkgImagePreviews.slice(existingPkgImages.length).map((src, i) => (
                      <div key={i} className="relative w-24 h-24">
                        <Image src={src} alt="" fill className="rounded-xl object-cover" />
                        <button type="button" onClick={() => {
                          setPkgImageFiles((p) => p.filter((_, j) => j !== i));
                          setPkgImagePreviews((p) => p.filter((_, j) => j !== (i + existingPkgImages.length)));
                        }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dropzone */}
              <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}>
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-foreground font-medium">
                  {isDragActive ? "Drop images here…" : "Drag & drop or click to upload package photos"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP — unlimited photos</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Submit ───────────────────────────────────────────────────────── */}
        <div className="flex gap-3 pb-10">
          <Button type="submit" disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl text-sm min-w-[160px]">
            {isSubmitting ? "Saving…" : initialData ? "Update Package" : "Create Package"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}
            className="px-6 py-3 rounded-xl text-sm">
            Cancel
          </Button>
        </div>

      </form>
    </Form>
  );
}

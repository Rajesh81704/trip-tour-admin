"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Package, FlightOption, HotelOption } from "@/types/package";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus, Upload, X, Plane, Hotel } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const flightSchema = z.object({
  type: z.enum(["main", "internal"]),
  airline: z.string().min(1, "Airline is required"),
  flightNumber: z.string().min(1, "Flight number is required"),
  departureCity: z.string().min(1, "Departure city is required"),
  departureAirport: z.string().min(1, "Departure airport is required"),
  departureTime: z.string().min(1, "Departure time is required"),
  departureDate: z.string().min(1, "Departure date is required"),
  arrivalCity: z.string().min(1, "Arrival city is required"),
  arrivalAirport: z.string().min(1, "Arrival airport is required"),
  arrivalTime: z.string().min(1, "Arrival time is required"),
  arrivalDate: z.string().min(1, "Arrival date is required"),
  duration: z.string().min(1, "Duration is required"),
  class: z.enum(["economy", "business", "first"]),
  price: z.number().min(0, "Price must be positive"),
  description: z.string().optional(),
  image: z.object({
    url: z.string(),
    public_id: z.string(),
  }).optional(),
  _id: z.string().optional(),
});

const hotelSchema = z.object({
  location: z.string().min(1, "Location is required"),
  hotelName: z.string().min(1, "Hotel name is required"),
  nights: z.number().min(1, "Nights must be at least 1"),
  roomType: z.string().min(1, "Room type is required"),
  amenities: z.array(z.string()).optional(),
  price: z.number().min(0, "Price must be positive"),
  starRating: z.number().min(1).max(5).optional(),
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
  description: z.string().optional(),
  image: z.object({
    url: z.string(),
    public_id: z.string(),
  }).optional(),
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
    day: z.number().min(1, "Days must be at least 1"),
    night: z.number().min(0, "Nights cannot be negative"),
  }),
  price: z.number().min(0, "Price must be positive"),
  discount: z.number().min(0, "Discount must be positive"),
  features: z
    .array(z.string().min(1, "Feature cannot be empty"))
    .min(1, "At least one feature is required"),
  highlights: z
    .array(z.string().min(1, "Highlight cannot be empty"))
    .min(1, "At least one highlight is required"),
  itinerary: z
    .array(
      z.object({
        day: z.number(),
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        _id: z.string().optional(),
      })
    )
    .min(1, "At least one itinerary item is required"),
  inclusions: z
    .array(z.string().min(1, "Inclusion cannot be empty"))
    .min(1, "At least one inclusion is required"),
  exclusions: z
    .array(z.string().min(1, "Exclusion cannot be empty"))
    .min(1, "At least one exclusion is required"),
  category: z.string().min(1, "Category is required"),
  flights: z.array(flightSchema).optional(),
  hotels: z.array(hotelSchema).optional(),
});

interface PackageFormProps {
  initialData?: Package;
  onSubmit: (data: FormData) => Promise<void>;
}

export default function PackageForm({
  initialData,
  onSubmit,
}: PackageFormProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(
    initialData?.images.map((img) => img.url) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFlightsSection, setShowFlightsSection] = useState(
    (initialData?.flights && initialData.flights.length > 0) || false
  );
  const [showHotelsSection, setShowHotelsSection] = useState(
    (initialData?.hotels && initialData.hotels.length > 0) || false
  );
  
  // Flight and hotel image states
  const [flightImages, setFlightImages] = useState<{ [key: number]: File | null }>({});
  const [flightPreviews, setFlightPreviews] = useState<{ [key: number]: string }>({});
  const [hotelImages, setHotelImages] = useState<{ [key: number]: File | null }>({});
  const [hotelPreviews, setHotelPreviews] = useState<{ [key: number]: string }>({});
  
  const router = useRouter();

  const form = useForm<z.infer<typeof packageSchema>>({
    resolver: zodResolver(packageSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      location: { city: "", state: "", destination: "" },
      duration: { day: 1, night: 0 },
      price: 0,
      discount: 0,
      features: [""],
      highlights: [""],
      itinerary: [{ day: 1, title: "", description: "" }],
      inclusions: [""],
      exclusions: [""],
      category: "",
      flights: [],
      hotels: [],
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages((prev) => [...prev, ...acceptedFiles]);
    acceptedFiles.forEach((file) => {
      const preview = URL.createObjectURL(file);
      setPreviews((prev) => [...prev, preview]);
    });
  }, []);

  const onFlightImageDrop = useCallback(
    (flightIndex: number, acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFlightImages((prev) => ({ ...prev, [flightIndex]: file }));
        const preview = URL.createObjectURL(file);
        setFlightPreviews((prev) => ({ ...prev, [flightIndex]: preview }));
      }
    },
    []
  );

  const onHotelImageDrop = useCallback(
    (hotelIndex: number, acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setHotelImages((prev) => ({ ...prev, [hotelIndex]: file }));
        const preview = URL.createObjectURL(file);
        setHotelPreviews((prev) => ({ ...prev, [hotelIndex]: preview }));
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
  });

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values: z.infer<typeof packageSchema>) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();

      // Process flights with images
      if (values.flights && values.flights.length > 0) {
        const flightsWithImages = values.flights.map((flight, index) => ({
          ...flight,
          image: flightImages[index] ? { file: flightImages[index] } : flight.image,
        }));
        formData.append("flights", JSON.stringify(flightsWithImages.map(f => {
          const { image, ...rest } = f;
          return rest;
        })));
        
        // Append flight images
        Object.entries(flightImages).forEach(([index, file]) => {
          if (file) {
            formData.append(`flight_image_${index}`, file);
          }
        });
      }

      // Process hotels with images
      if (values.hotels && values.hotels.length > 0) {
        const hotelsWithImages = values.hotels.map((hotel, index) => ({
          ...hotel,
          image: hotelImages[index] ? { file: hotelImages[index] } : hotel.image,
        }));
        formData.append("hotels", JSON.stringify(hotelsWithImages.map(h => {
          const { image, ...rest } = h;
          return rest;
        })));

        // Append hotel images
        Object.entries(hotelImages).forEach(([index, file]) => {
          if (file) {
            formData.append(`hotel_image_${index}`, file);
          }
        });
      }

      // Append all other form fields (excluding flights and hotels as they're handled above)
      Object.entries(values).forEach(([key, value]) => {
        if (key !== "flights" && key !== "hotels") {
          if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Append package images
      images.forEach((image) => {
        formData.append("images", image);
      });

      await onSubmit(formData);

      if (!initialData) {
        toast.success("Package created successfully");
        router.push("/packages");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, () => {
          toast.error("Please fill in all required fields correctly");
        })}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="location.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location.state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location.destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duration.day"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Days</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration.night"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nights</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center mb-4">
                <FormLabel>Features</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const lastItem = field.value[field.value.length - 1];
                    if (lastItem && lastItem.trim() !== "") {
                      field.onChange([...field.value, ""]);
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </div>
              <FormControl>
                <div className="space-y-2">
                  {field.value.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => {
                          const newValue = [...field.value];
                          newValue[index] = e.target.value;
                          field.onChange(newValue);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const currentValue = e.currentTarget.value;
                            if (currentValue.trim() !== "") {
                              field.onChange([...field.value, ""]);
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const newValue = [...field.value];
                          newValue.splice(index, 1);
                          field.onChange(newValue);
                        }}
                        disabled={field.value.length === 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="highlights"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center mb-4">
                <FormLabel>Highlights</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const lastItem = field.value[field.value.length - 1];
                    if (lastItem && lastItem.trim() !== "") {
                      field.onChange([...field.value, ""]);
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Highlight
                </Button>
              </div>
              <FormControl>
                <div className="space-y-2">
                  {field.value.map((highlight, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={highlight}
                        onChange={(e) => {
                          const newValue = [...field.value];
                          newValue[index] = e.target.value;
                          field.onChange(newValue);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const currentValue = e.currentTarget.value;
                            if (currentValue.trim() !== "") {
                              field.onChange([...field.value, ""]);
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const newValue = [...field.value];
                          newValue.splice(index, 1);
                          field.onChange(newValue);
                        }}
                        disabled={field.value.length === 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inclusions"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center mb-4">
                <FormLabel>Inclusions</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const lastItem = field.value[field.value.length - 1];
                    if (lastItem && lastItem.trim() !== "") {
                      field.onChange([...field.value, ""]);
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Inclusion
                </Button>
              </div>
              <FormControl>
                <div className="space-y-2">
                  {field.value.map((inclusion, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={inclusion}
                        onChange={(e) => {
                          const newValue = [...field.value];
                          newValue[index] = e.target.value;
                          field.onChange(newValue);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const currentValue = e.currentTarget.value;
                            if (currentValue.trim() !== "") {
                              field.onChange([...field.value, ""]);
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const newValue = [...field.value];
                          newValue.splice(index, 1);
                          field.onChange(newValue);
                        }}
                        disabled={field.value.length === 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="exclusions"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center mb-4">
                <FormLabel>Exclusions</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const lastItem = field.value[field.value.length - 1];
                    if (lastItem && lastItem.trim() !== "") {
                      field.onChange([...field.value, ""]);
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exclusion
                </Button>
              </div>
              <FormControl>
                <div className="space-y-2">
                  {field.value.map((exclusion, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={exclusion}
                        onChange={(e) => {
                          const newValue = [...field.value];
                          newValue[index] = e.target.value;
                          field.onChange(newValue);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const currentValue = e.currentTarget.value;
                            if (currentValue.trim() !== "") {
                              field.onChange([...field.value, ""]);
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const newValue = [...field.value];
                          newValue.splice(index, 1);
                          field.onChange(newValue);
                        }}
                        disabled={field.value.length === 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="itinerary"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center mb-4">
                <FormLabel>Itinerary</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const lastItem = field.value[field.value.length - 1];
                    if (
                      lastItem &&
                      lastItem.title.trim() !== "" &&
                      lastItem.description.trim() !== ""
                    ) {
                      field.onChange([
                        ...field.value,
                        {
                          day: field.value.length + 1,
                          title: "",
                          description: "",
                        },
                      ]);
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Itinerary Item
                </Button>
              </div>
              {field.value.map((item, index) => (
                <div
                  key={index}
                  className="relative border border-0.5 border-gray-200/20 p-4 rounded-lg mb-4"
                >
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Day {item.day}</h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          const newValue = [...field.value];
                          newValue.splice(index, 1);
                          field.onChange(newValue);
                        }}
                        disabled={field.value.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Day number"
                      type="number"
                      value={item.day}
                      readOnly
                      onChange={(e) => {
                        const newValue = [...field.value];
                        newValue[index].day = parseInt(e.target.value);
                        field.onChange(newValue);
                      }}
                    />
                    <Input
                      placeholder="Title"
                      value={item.title}
                      onChange={(e) => {
                        const newValue = [...field.value];
                        newValue[index].title = e.target.value;
                        field.onChange(newValue);
                      }}
                    />
                    <Textarea
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => {
                        const newValue = [...field.value];
                        newValue[index].description = e.target.value;
                        field.onChange(newValue);
                      }}
                    />
                  </div>
                </div>
              ))}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* FLIGHTS SECTION */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Flights (Optional)</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFlightsSection(!showFlightsSection)}
            >
              {showFlightsSection ? "Hide" : "Show"} Flights
            </Button>
          </div>

          {showFlightsSection && (
            <FormField
              control={form.control}
              name="flights"
              render={({ field }) => (
                <FormItem>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newFlight: FlightOption = {
                        type: "main",
                        airline: "",
                        flightNumber: "",
                        departureCity: "",
                        departureAirport: "",
                        departureTime: "",
                        departureDate: "",
                        arrivalCity: "",
                        arrivalAirport: "",
                        arrivalTime: "",
                        arrivalDate: "",
                        duration: "",
                        class: "economy",
                        price: 0,
                        description: "",
                      };
                      field.onChange([...(field.value || []), newFlight]);
                    }}
                    className="mb-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Flight
                  </Button>

                  <div className="space-y-4">
                    {field.value && field.value.map((flight, flightIndex) => (
                      <div
                        key={flightIndex}
                        className="border border-0.5 border-blue-200/30 p-4 rounded-lg bg-blue-50/30"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">
                            Flight {flightIndex + 1} - {flight.airline}
                          </h4>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              const newFlights = (field.value || []).filter(
                                (_: FlightOption, i: number) => i !== flightIndex
                              );
                              field.onChange(newFlights);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Type</label>
                            <select
                              value={flight.type}
                              onChange={(e) => {
                                const newFlights = [...(field.value || [])];
                                newFlights[flightIndex].type = e.target.value as "main" | "internal";
                                field.onChange(newFlights);
                              }}
                              className="w-full border rounded p-2 text-sm"
                            >
                              <option value="main">Main Flight (International)</option>
                              <option value="internal">Internal Flight (Domestic)</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Airline</label>
                            <Input
                              value={flight.airline}
                              onChange={(e) => {
                                const newFlights = [...(field.value || [])];
                                newFlights[flightIndex].airline = e.target.value;
                                field.onChange(newFlights);
                              }}
                              placeholder="e.g., VietJet Air"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Flight Number</label>
                            <Input
                              value={flight.flightNumber}
                              onChange={(e) => {
                                const newFlights = [...(field.value || [])];
                                newFlights[flightIndex].flightNumber = e.target.value;
                                field.onChange(newFlights);
                              }}
                              placeholder="e.g., VJ 1806"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Class</label>
                            <select
                              value={flight.class}
                              onChange={(e) => {
                                const newFlights = [...(field.value || [])];
                                newFlights[flightIndex].class = e.target.value as "economy" | "business" | "first";
                                field.onChange(newFlights);
                              }}
                              className="w-full border rounded p-2 text-sm"
                            >
                              <option value="economy">Economy</option>
                              <option value="business">Business</option>
                              <option value="first">First</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Departure City</label>
                            <Input
                              value={flight.departureCity}
                              onChange={(e) => {
                                const newFlights = [...(field.value || [])];
                                newFlights[flightIndex].departureCity = e.target.value;
                                field.onChange(newFlights);
                              }}
                              placeholder="e.g., Ahmedabad, IN"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Departure Airport</label>
                            <Input
                              value={flight.departureAirport}
                              onChange={(e) => {
                                const newFlights = [...(field.value || [])];
                                newFlights[flightIndex].departureAirport = e.target.value;
                                field.onChange(newFlights);
                              }}
                              placeholder="e.g., AMD"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Departure Time</label>
                            <Input
                              type="time"
                              value={flight.departureTime}
                              onChange={(e) => {
                                const newFlights = [...(field.value || [])];
                                newFlights[flightIndex].departureTime = e.target.value;
                                field.onChange(newFlights);
                              }}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Departure Date</label>
                            <Input
                              type="date"
                              value={flight.departureDate}
                              onChange={(e) => {
                                const newFlights = [...(field.value || [])];
                                newFlights[flightIndex].departureDate = e.target.value;
                                field.onChange(newFlights);
                              }}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Arrival City</label>
                            <Input
                              value={flight.arrivalCity}
                              onChange={(e) => {
                                const newFlights = [...(field.value || [])];
                                newFlights[flightIndex].arrivalCity = e.target.value;
                                field.onChange(newFlights);
                              }}
                              placeholder="e.g., Ho Chi Minh City, VN"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Arrival Airport</label>
                            <Input
                              value={flight.arrivalAirport}
                              onChange={(e) => {
                                const newFlights = [...(field.value || [])];
                                newFlights[flightIndex].arrivalAirport = e.target.value;
                                field.onChange(newFlights);
                              }}
                              placeholder="e.g., SGN"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Arrival Time</label>
                            <Input
                              type="time"
                              value={flight.arrivalTime}
                              onChange={(e) => {
                                const newFlights = [...(field.value || [])];
                                newFlights[flightIndex].arrivalTime = e.target.value;
                                field.onChange(newFlights);
                              }}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Arrival Date</label>
                            <Input
                              type="date"
                              value={flight.arrivalDate}
                              onChange={(e) => {
                                const newFlights = [...(field.value || [])];
                                newFlights[flightIndex].arrivalDate = e.target.value;
                                field.onChange(newFlights);
                              }}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Duration</label>
                            <Input
                              value={flight.duration}
                              onChange={(e) => {
                                const newFlights = [...(field.value || [])];
                                newFlights[flightIndex].duration = e.target.value;
                                field.onChange(newFlights);
                              }}
                              placeholder="e.g., 9h 20m"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Price</label>
                            <Input
                              type="number"
                              value={flight.price}
                              onChange={(e) => {
                                const newFlights = [...(field.value || [])];
                                newFlights[flightIndex].price = parseFloat(e.target.value);
                                field.onChange(newFlights);
                              }}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Description</label>
                            <Textarea
                              value={flight.description || ""}
                              onChange={(e) => {
                                const newFlights = [...(field.value || [])];
                                newFlights[flightIndex].description = e.target.value;
                                field.onChange(newFlights);
                              }}
                              placeholder="Optional flight details"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Flight Image (Optional)</label>
                            <div className="flex gap-3">
                              <div className="flex-1">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files) {
                                      onFlightImageDrop(flightIndex, Array.from(e.target.files));
                                    }
                                  }}
                                  className="hidden"
                                  id={`flight-image-${flightIndex}`}
                                />
                                <label
                                  htmlFor={`flight-image-${flightIndex}`}
                                  className="cursor-pointer border-2 border-dashed border-blue-300 rounded p-3 text-center hover:bg-blue-50 block"
                                >
                                  <Upload className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                                  <span className="text-xs text-gray-600">Click to upload flight image</span>
                                </label>
                              </div>
                              {(flightPreviews[flightIndex] || flight.image?.url) && (
                                <div className="relative">
                                  <Image
                                    src={flightPreviews[flightIndex] || flight.image?.url || ""}
                                    alt="Flight"
                                    width={80}
                                    height={80}
                                    className="rounded object-cover"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-0 right-0 h-5 w-5"
                                    onClick={() => {
                                      setFlightImages((prev) => {
                                        const newFlights = { ...prev };
                                        delete newFlights[flightIndex];
                                        return newFlights;
                                      });
                                      setFlightPreviews((prev) => {
                                        const newFlights = { ...prev };
                                        delete newFlights[flightIndex];
                                        return newFlights;
                                      });
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </FormItem>
              )}
            />
          )}
        </div>

        {/* HOTELS SECTION */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Hotel className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Hotels (Optional)</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowHotelsSection(!showHotelsSection)}
            >
              {showHotelsSection ? "Hide" : "Show"} Hotels
            </Button>
          </div>

          {showHotelsSection && (
            <FormField
              control={form.control}
              name="hotels"
              render={({ field }) => (
                <FormItem>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newHotel: HotelOption = {
                        location: "",
                        hotelName: "",
                        nights: 1,
                        roomType: "",
                        amenities: [],
                        price: 0,
                        starRating: 3,
                        description: "",
                      };
                      field.onChange([...(field.value || []), newHotel]);
                    }}
                    className="mb-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Hotel
                  </Button>

                  <div className="space-y-4">
                    {field.value && field.value.map((hotel, hotelIndex) => (
                      <div
                        key={hotelIndex}
                        className="border border-0.5 border-green-200/30 p-4 rounded-lg bg-green-50/30"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">
                            Hotel {hotelIndex + 1} - {hotel.hotelName}
                          </h4>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              const newHotels = (field.value || []).filter(
                                (_: HotelOption, i: number) => i !== hotelIndex
                              );
                              field.onChange(newHotels);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Location</label>
                            <Input
                              value={hotel.location}
                              onChange={(e) => {
                                const newHotels = [...(field.value || [])];
                                newHotels[hotelIndex].location = e.target.value;
                                field.onChange(newHotels);
                              }}
                              placeholder="e.g., Hanoi"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Hotel Name</label>
                            <Input
                              value={hotel.hotelName}
                              onChange={(e) => {
                                const newHotels = [...(field.value || [])];
                                newHotels[hotelIndex].hotelName = e.target.value;
                                field.onChange(newHotels);
                              }}
                              placeholder="e.g., Sunway Hotel"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Number of Nights</label>
                            <Input
                              type="number"
                              value={hotel.nights}
                              onChange={(e) => {
                                const newHotels = [...(field.value || [])];
                                newHotels[hotelIndex].nights = parseInt(e.target.value);
                                field.onChange(newHotels);
                              }}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Room Type</label>
                            <Input
                              value={hotel.roomType}
                              onChange={(e) => {
                                const newHotels = [...(field.value || [])];
                                newHotels[hotelIndex].roomType = e.target.value;
                                field.onChange(newHotels);
                              }}
                              placeholder="e.g., Deluxe Room"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Price (per night)</label>
                            <Input
                              type="number"
                              value={hotel.price}
                              onChange={(e) => {
                                const newHotels = [...(field.value || [])];
                                newHotels[hotelIndex].price = parseFloat(e.target.value);
                                field.onChange(newHotels);
                              }}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Star Rating</label>
                            <select
                              value={hotel.starRating || 3}
                              onChange={(e) => {
                                const newHotels = [...(field.value || [])];
                                newHotels[hotelIndex].starRating = parseInt(e.target.value);
                                field.onChange(newHotels);
                              }}
                              className="w-full border rounded p-2 text-sm"
                            >
                              <option value="1">1 Star</option>
                              <option value="2">2 Stars</option>
                              <option value="3">3 Stars</option>
                              <option value="4">4 Stars</option>
                              <option value="5">5 Stars</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Check-in Date</label>
                            <Input
                              type="date"
                              value={hotel.checkInDate || ""}
                              onChange={(e) => {
                                const newHotels = [...(field.value || [])];
                                newHotels[hotelIndex].checkInDate = e.target.value;
                                field.onChange(newHotels);
                              }}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Check-out Date</label>
                            <Input
                              type="date"
                              value={hotel.checkOutDate || ""}
                              onChange={(e) => {
                                const newHotels = [...(field.value || [])];
                                newHotels[hotelIndex].checkOutDate = e.target.value;
                                field.onChange(newHotels);
                              }}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Amenities</label>
                            <Input
                              value={hotel.amenities?.join(", ") || ""}
                              onChange={(e) => {
                                const newHotels = [...(field.value || [])];
                                newHotels[hotelIndex].amenities = e.target.value
                                  .split(",")
                                  .map((a) => a.trim())
                                  .filter((a) => a !== "");
                                field.onChange(newHotels);
                              }}
                              placeholder="e.g., WiFi, AC, TV, Gym (comma-separated)"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Description</label>
                            <Textarea
                              value={hotel.description || ""}
                              onChange={(e) => {
                                const newHotels = [...(field.value || [])];
                                newHotels[hotelIndex].description = e.target.value;
                                field.onChange(newHotels);
                              }}
                              placeholder="Optional hotel details"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Hotel Image (Optional)</label>
                            <div className="flex gap-3">
                              <div className="flex-1">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files) {
                                      onHotelImageDrop(hotelIndex, Array.from(e.target.files));
                                    }
                                  }}
                                  className="hidden"
                                  id={`hotel-image-${hotelIndex}`}
                                />
                                <label
                                  htmlFor={`hotel-image-${hotelIndex}`}
                                  className="cursor-pointer border-2 border-dashed border-green-300 rounded p-3 text-center hover:bg-green-50 block"
                                >
                                  <Upload className="h-4 w-4 mx-auto mb-1 text-green-500" />
                                  <span className="text-xs text-gray-600">Click to upload hotel image</span>
                                </label>
                              </div>
                              {(hotelPreviews[hotelIndex] || hotel.image?.url) && (
                                <div className="relative">
                                  <Image
                                    src={hotelPreviews[hotelIndex] || hotel.image?.url || ""}
                                    alt="Hotel"
                                    width={80}
                                    height={80}
                                    className="rounded object-cover"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-0 right-0 h-5 w-5"
                                    onClick={() => {
                                      setHotelImages((prev) => {
                                        const newHotels = { ...prev };
                                        delete newHotels[hotelIndex];
                                        return newHotels;
                                      });
                                      setHotelPreviews((prev) => {
                                        const newHotels = { ...prev };
                                        delete newHotels[hotelIndex];
                                        return newHotels;
                                      });
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </FormItem>
              )}
            />
          )}
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
            isDragActive ? "border-primary bg-primary/10" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag &apos;n&apos; drop some images here, or click to select files
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative">
              <Image
                src={preview}
                alt={`Preview ${index + 1}`}
                width={200}
                height={200}
                className="rounded-lg object-cover w-full h-40"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          type="submit"
          className="w-full md:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Creating..."
            : initialData
            ? "Update Package"
            : "Create Package"}
        </Button>
      </form>
    </Form>
  );
}

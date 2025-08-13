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
import { Package } from "@/types/package";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages((prev) => [...prev, ...acceptedFiles]);
    acceptedFiles.forEach((file) => {
      const preview = URL.createObjectURL(file);
      setPreviews((prev) => [...prev, preview]);
    });
  }, []);

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
    const formData = new FormData();

    // Append all form fields
    Object.entries(values).forEach(([key, value]) => {
      if (typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    });

    // Append images
    images.forEach((image) => {
      formData.append("images", image);
    });

    await onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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

        <Button type="submit" className="w-full md:w-auto">
          {initialData ? "Update Package" : "Create Package"}
        </Button>
      </form>
    </Form>
  );
}

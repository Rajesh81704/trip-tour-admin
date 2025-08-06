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
import { Pencil, Star } from "lucide-react";
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

  const handleDelete = async () => {
    await onDelete(pkg._id);
    setVisible(false);
  };
  console.log(pkg);

  if (!visible) return null;

  return (
    <Card className="w-full max-w-md shadow-lg hover:shadow-xl transition-shadow duration-200 py-0">
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
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary">
            {pkg.location.city}, {pkg.location.state}
          </Badge>
          {pkg.discount > 0 && (
            <Badge variant="destructive">-{pkg.discount}%</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="py-4 px-6">
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
          className="w- cursor-pointer"
          variant="default"
          onClick={() => router.push(`/packages/edit/${pkg._id}`)}
        >
          Edit <Pencil className="w-4 h-4" />
        </Button>
        <ConfirmDelete onConfirm={handleDelete} />
      </CardFooter>
    </Card>
  );
}

"use client";

import { useEffect, useState, useCallback, use } from "react";
import api from "@/lib/api";
import { Package } from "@/types/package";
import ConfirmDelete from "@/components/cards/confirmDelete";
import {
  ArrowLeft,
  Star,
  MessageSquare,
  User,
  Trash2,
  Award,
  Pencil,
  MapPin,
  Clock,
  Tag,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ReviewUser {
  _id: string;
  name?: string;
  email?: string;
  avatar?: string;
}

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  review?: string;
  user?: ReviewUser;
  createdAt?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PackageDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [pkgRes, reviewsRes] = await Promise.all([
        api.get<{ package: Package }>(`/packages/${id}`),
        api.get(`/reviews?packageId=${id}`),
      ]);

      if (pkgRes.data?.package) {
        setPkg(pkgRes.data.package);
      }
      setReviews(reviewsRes.data || []);
    } catch (error) {
      console.error("Error fetching package detail:", error);
      toast.error("Failed to load package details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const res = await api.delete(`/reviews/${reviewId}`);
      if (res.status === 200 || res.data?.success) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        toast.success("Review deleted successfully");
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  const handleDeletePackage = async () => {
    try {
      await api.delete(`/packages/${id}`);
      toast.success("Package deleted successfully");
      router.push("/packages");
    } catch (error) {
      console.error("Error deleting package:", error);
      toast.error("Failed to delete package");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-muted-foreground">Loading package & reviews...</p>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Package Not Found</h2>
        <Link href="/packages" className="text-primary hover:underline text-sm font-semibold">
          ← Back to Packages
        </Link>
      </div>
    );
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : pkg.reviews && pkg.reviews.length > 0
      ? (
          pkg.reviews.reduce(
            (acc, r) => acc + (typeof r === "number" ? r : r.rating || 0),
            0
          ) / pkg.reviews.length
        ).toFixed(1)
      : null;

  const mainImageUrl =
    pkg.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";

  const finalPrice = Math.round(
    pkg.price * (1 - (pkg.discount || 0) / 100)
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* ── Top Navigation Bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/packages"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors bg-card border border-border/60 px-4 py-2 rounded-xl shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Packages
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/packages/edit/${pkg._id}`}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-xl text-xs shadow-xs hover:bg-primary/90 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Package
          </Link>
          <ConfirmDelete
            title="Package"
            onConfirm={handleDeletePackage}
            className="h-9 px-4 rounded-xl text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-0 transition-colors cursor-pointer"
          />
        </div>
      </div>

      {/* ── Package Hero & Banner Card ────────────────────────────────────── */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        <div className="lg:col-span-1 aspect-[4/3] relative rounded-xl overflow-hidden bg-muted border border-border/60">
          <Image
            src={mainImageUrl}
            alt={pkg.title}
            fill
            className="object-cover"
          />
          {pkg.discount > 0 && (
            <div className="absolute top-3 left-3 bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {pkg.discount}% OFF
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-full font-semibold text-foreground border border-border/60">
                <MapPin className="w-3 h-3 text-rose-500" />
                {pkg.location.city}, {pkg.location.state}, {pkg.location.destination}
              </span>
              <span className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-full font-semibold text-foreground border border-border/60">
                <Clock className="w-3 h-3 text-amber-500" />
                {pkg.duration.day} Days / {pkg.duration.night} Nights
              </span>
              {pkg.category && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold border border-primary/20">
                  <Tag className="w-3 h-3" />
                  {pkg.category}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {pkg.title}
            </h1>

            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {pkg.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/60">
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Package Tariff</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-foreground">
                  ₹{finalPrice.toLocaleString("en-IN")}
                </span>
                {pkg.discount > 0 && (
                  <span className="text-xs text-muted-foreground line-through">
                    ₹{pkg.price?.toLocaleString("en-IN")}
                  </span>
                )}
                <span className="text-xs text-muted-foreground font-medium">per person</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl text-amber-700 dark:text-amber-300">
              <Award className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Average Traveler Score</p>
                <p className="text-sm font-black flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {avgRating ? `${avgRating} / 5.0` : "No Ratings Yet"} ({reviews.length} reviews)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dedicated Reviews & Ratings Section ──────────────────────────── */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">
                All Traveler Reviews & Ratings
              </h2>
              <p className="text-xs text-muted-foreground">
                Review feedback submitted by verified travelers for {pkg.title}
              </p>
            </div>
          </div>

          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20">
            Total Reviews: {reviews.length}
          </span>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((item) => {
              const commentText = item.comment || item.review || "No written review comment provided.";

              return (
                <div
                  key={item._id}
                  className="bg-muted/30 border border-border/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-border transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 font-extrabold text-xs px-2.5 py-1 rounded-lg border border-yellow-400/30">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{item.rating?.toFixed(1) || "5.0"} / 5.0</span>
                      </div>

                      <ConfirmDelete
                        onConfirm={() => handleDeleteReview(item._id)}
                        title="Review"
                        className="h-8 px-2 rounded-lg text-destructive hover:bg-destructive/10 border-0"
                      />
                    </div>

                    <p className="text-xs text-foreground/90 italic bg-card p-3 rounded-xl border border-border/40 leading-relaxed min-h-[60px]">
                      "{commentText}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{item.user?.name || item.user?.email || "Anonymous Traveler"}</span>
                    </div>

                    {item.createdAt && (
                      <span className="text-[10px]">
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="text-base font-bold text-foreground">No Customer Reviews Yet</h3>
            <p className="text-xs">This package does not have any customer reviews submitted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

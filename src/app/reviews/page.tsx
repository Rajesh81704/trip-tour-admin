"use client";
import ConfirmDelete from "@/components/cards/confirmDelete";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { Star, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";

interface Review {
  _id: string;
  rating: number;
  review: string;
  user: {
    name: string;
    _id: string;
  };
  applaud: number;
  package: {
    title: string;
    _id: string;
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get("/reviews");
      console.log(response.data);
      setReviews(response.data as Review[]);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);

      if (response.status === 200) {
        setReviews(reviews.filter((review) => review._id !== reviewId));
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Reviews</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((review) => (
          <Card key={review._id} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">
                Package: {review.package?.title || "No package"}
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="ml-1">{review.rating}</span>
                </div>

                <ConfirmDelete
                  onConfirm={() => handleDelete(review._id)}
                  title="Review"
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{review.review}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>By: {review.user.name}</span>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{review.applaud}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

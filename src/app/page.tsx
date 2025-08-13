"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Package,
  Star,
  Users,
  Send,
  Mail,
  MessageSquare,
} from "lucide-react";
import api from "@/lib/api";

interface Review {
  _id: string;
  rating: number;
  comment: string;
  user: {
    _id: string;
    name: string;
  };
  package: {
    _id: string;
  };
  createdAt: string;
}

interface Inquiry {
  _id: string;
  name: string;
  mobileNumber: string;
  email: string;
  destination: string;
  message: string;
  createdAt: string;
}

interface B2BRequest {
  _id: string;
  companyName: string;
  email: string;
  phone: string;
  website?: string;
  message: string;
  contactName: string;
  inquiryType: string;
  createdAt: string;
}

interface Package {
  _id: string;
  title: string;
  location: {
    city: string;
    state: string;
    destination: string;
  };
  duration: {
    day: number;
    night: number;
  };
  price: number;
  discount: number;
  reviews: string[];
  images: string[];
  features: string[];
  description: string;
  highlights: string[];
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    _id: string;
  }>;
  inclusions: string[];
  exclusions: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardData {
  totalUsers: number;
  totalPackages: number;
  totalInquiries: number;
  totalB2BRequests: number;
  totalContacts: number;
  totalReviews: number;
  recentInquiries: Inquiry[];
  recentReviews: Review[];
  recentB2BRequests: B2BRequest[];
  reviewStats: {
    averageRating: number;
    fiveStars: number;
    fourStars: number;
    threeStars: number;
    twoStars: number;
    oneStar: number;
  };
  popularPackages: Package[];
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalUsers: 0,
    totalPackages: 0,
    totalInquiries: 0,
    totalB2BRequests: 0,
    totalContacts: 0,
    totalReviews: 0,
    recentInquiries: [],
    recentReviews: [],
    recentB2BRequests: [],
    reviewStats: {
      averageRating: 0,
      fiveStars: 0,
      fourStars: 0,
      threeStars: 0,
      twoStars: 0,
      oneStar: 0,
    },
    popularPackages: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/info");
        setDashboardData(response.data as unknown as DashboardData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-4 md:p-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Overview Stats - Spans 2 columns on larger screens */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Users</p>
                <p className="text-2xl font-bold">{dashboardData.totalUsers}</p>
              </div>
              <div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
                <Package className="w-6 h-6 mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Packages</p>
                <p className="text-2xl font-bold">
                  {dashboardData.totalPackages}
                </p>
              </div>
              <div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
                <MessageSquare className="w-6 h-6 mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Inquiries</p>
                <p className="text-2xl font-bold">
                  {dashboardData.totalInquiries}
                </p>
              </div>
              <div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
                <Send className="w-6 h-6 mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">B2B</p>
                <p className="text-2xl font-bold">
                  {dashboardData.totalB2BRequests}
                </p>
              </div>
              <div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
                <Mail className="w-6 h-6 mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Contacts</p>
                <p className="text-2xl font-bold">
                  {dashboardData.totalContacts}
                </p>
              </div>
              <div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
                <Star className="w-6 h-6 mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Reviews</p>
                <p className="text-2xl font-bold">
                  {dashboardData.totalReviews}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Statistics - Spans 2 columns on larger screens */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Review Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">
                  {dashboardData.reviewStats.averageRating.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-2">
                  <div className="w-12 text-sm">{stars} Stars</div>
                  <div className="flex-1 h-2 bg-primary/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${
                          (dashboardData.reviewStats[
                            `${stars}Stars` as keyof typeof dashboardData.reviewStats
                          ] /
                            dashboardData.totalReviews) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="w-8 text-sm text-right">
                    {
                      dashboardData.reviewStats[
                        `${stars}Stars` as keyof typeof dashboardData.reviewStats
                      ]
                    }
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Section - Spans full width on mobile, 2 columns on larger screens */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Recent Inquiries
                </h3>
                <div className="space-y-2">
                  {dashboardData.recentInquiries.map((inquiry) => (
                    <div key={inquiry._id} className="p-2 bg-muted rounded-lg">
                      <p className="font-medium">{inquiry.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {inquiry.destination}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Recent Reviews
                </h3>
                <div className="space-y-2">
                  {dashboardData.recentReviews.map((review) => (
                    <div key={review._id} className="p-2 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{review.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {review.rating} ★
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {review.comment}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Recent B2B Requests
                </h3>
                <div className="space-y-2">
                  {dashboardData.recentB2BRequests.map((request) => (
                    <div key={request._id} className="p-2 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{request.companyName}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.contactName}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.inquiryType}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

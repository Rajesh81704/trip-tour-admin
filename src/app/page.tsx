// "use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Calendar,
//   Package,
//   Star,
//   Users,
//   Send,
//   Mail,
//   MessageSquare,
// } from "lucide-react";
// import api from "@/lib/api";

// interface Review {
//   _id: string;
//   rating: number;
//   comment: string;
//   user: {
//     _id: string;
//     name: string;
//   };
//   package: {
//     _id: string;
//   };
//   createdAt: string;
// }

// interface Inquiry {
//   _id: string;
//   name: string;
//   mobileNumber: string;
//   email: string;
//   destination: string;
//   message: string;
//   createdAt: string;
// }

// interface B2BRequest {
//   _id: string;
//   companyName: string;
//   email: string;
//   phone: string;
//   website?: string;
//   message: string;
//   contactName: string;
//   inquiryType: string;
//   createdAt: string;
// }

// interface Package {
//   _id: string;
//   title: string;
//   location: {
//     city: string;
//     state: string;
//     destination: string;
//   };
//   duration: {
//     day: number;
//     night: number;
//   };
//   price: number;
//   discount: number;
//   reviews: string[];
//   images: string[];
//   features: string[];
//   description: string;
//   highlights: string[];
//   itinerary: Array<{
//     day: number;
//     title: string;
//     description: string;
//     _id: string;
//   }>;
//   inclusions: string[];
//   exclusions: string[];
//   category: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface DashboardData {
//   totalUsers: number;
//   totalPackages: number;
//   totalInquiries: number;
//   totalB2BRequests: number;
//   totalContacts: number;
//   totalReviews: number;
//   recentInquiries: Inquiry[];
//   recentReviews: Review[];
//   recentB2BRequests: B2BRequest[];
//   reviewStats: {
//     averageRating: number;
//     fiveStars: number;
//     fourStars: number;
//     threeStars: number;
//     twoStars: number;
//     oneStar: number;
//   };
//   popularPackages: Package[];
// }

// export default function Dashboard() {
//   const [dashboardData, setDashboardData] = useState<DashboardData>({
//     totalUsers: 0,
//     totalPackages: 0,
//     totalInquiries: 0,
//     totalB2BRequests: 0,
//     totalContacts: 0,
//     totalReviews: 0,
//     recentInquiries: [],
//     recentReviews: [],
//     recentB2BRequests: [],
//     reviewStats: {
//       averageRating: 0,
//       fiveStars: 0,
//       fourStars: 0,
//       threeStars: 0,
//       twoStars: 0,
//       oneStar: 0,
//     },
//     popularPackages: [],
//   });

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const response = await api.get("/info");
//         setDashboardData(response.data as unknown as DashboardData);
//       } catch (error) {
//         console.error("Failed to fetch dashboard data:", error);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   return (
//     <div className="p-4 md:p-10">
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//         {/* Overview Stats - Spans 2 columns on larger screens */}
//         <Card className="md:col-span-2 lg:col-span-2">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Package className="w-5 h-5" />
//               Overview
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
//               <div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
//                 <Users className="w-6 h-6 mb-2 text-primary" />
//                 <p className="text-sm text-muted-foreground">Users</p>
//                 <p className="text-2xl font-bold">{dashboardData.totalUsers}</p>
//               </div>
//               <div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
//                 <Package className="w-6 h-6 mb-2 text-primary" />
//                 <p className="text-sm text-muted-foreground">Packages</p>
//                 <p className="text-2xl font-bold">
//                   {dashboardData.totalPackages}
//                 </p>
//               </div>
//               <div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
//                 <MessageSquare className="w-6 h-6 mb-2 text-primary" />
//                 <p className="text-sm text-muted-foreground">Inquiries</p>
//                 <p className="text-2xl font-bold">
//                   {dashboardData.totalInquiries}
//                 </p>
//               </div>
//               <div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
//                 <Send className="w-6 h-6 mb-2 text-primary" />
//                 <p className="text-sm text-muted-foreground">B2B</p>
//                 <p className="text-2xl font-bold">
//                   {dashboardData.totalB2BRequests}
//                 </p>
//               </div>
//               <div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
//                 <Mail className="w-6 h-6 mb-2 text-primary" />
//                 <p className="text-sm text-muted-foreground">Contacts</p>
//                 <p className="text-2xl font-bold">
//                   {dashboardData.totalContacts}
//                 </p>
//               </div>
//               <div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
//                 <Star className="w-6 h-6 mb-2 text-primary" />
//                 <p className="text-sm text-muted-foreground">Reviews</p>
//                 <p className="text-2xl font-bold">
//                   {dashboardData.totalReviews}
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Review Statistics - Spans 2 columns on larger screens */}
//         <Card className="md:col-span-2 lg:col-span-1">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Star className="w-5 h-5" />
//               Review Statistics
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="flex items-center justify-center mb-6">
//               <div className="text-center">
//                 <p className="text-4xl font-bold text-primary">
//                   {dashboardData.reviewStats.averageRating.toFixed(1)}
//                 </p>
//                 <p className="text-sm text-muted-foreground">Average Rating</p>
//               </div>
//             </div>
//             <div className="space-y-2">
//               {[5, 4, 3, 2, 1].map((stars) => (
//                 <div key={stars} className="flex items-center gap-2">
//                   <div className="w-12 text-sm">{stars} Stars</div>
//                   <div className="flex-1 h-2 bg-primary/10 rounded-full overflow-hidden">
//                     <div
//                       className="h-full bg-primary"
//                       style={{
//                         width: `${
//                           (dashboardData.reviewStats[
//                             `${stars}Stars` as keyof typeof dashboardData.reviewStats
//                           ] /
//                             dashboardData.totalReviews) *
//                           100
//                         }%`,
//                       }}
//                     />
//                   </div>
//                   <div className="w-8 text-sm text-right">
//                     {
//                       dashboardData.reviewStats[
//                         `${stars}Stars` as keyof typeof dashboardData.reviewStats
//                       ]
//                     }
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Recent Activity Section - Spans full width on mobile, 2 columns on larger screens */}
//         <Card className="md:col-span-2 lg:col-span-3">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Calendar className="w-5 h-5" />
//               Recent Activity
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <h3 className="font-medium mb-3 flex items-center gap-2">
//                   <MessageSquare className="w-4 h-4" />
//                   Recent Inquiries
//                 </h3>
//                 <div className="space-y-2">
//                   {dashboardData.recentInquiries.map((inquiry) => (
//                     <div key={inquiry._id} className="p-2 bg-muted rounded-lg">
//                       <p className="font-medium">{inquiry.name}</p>
//                       <p className="text-sm text-muted-foreground">
//                         {inquiry.destination}
//                       </p>
//                       <p className="text-xs text-muted-foreground mt-1">
//                         {new Date(inquiry.createdAt).toLocaleDateString()}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <h3 className="font-medium mb-3 flex items-center gap-2">
//                   <Star className="w-4 h-4" />
//                   Recent Reviews
//                 </h3>
//                 <div className="space-y-2">
//                   {dashboardData.recentReviews.map((review) => (
//                     <div key={review._id} className="p-2 bg-muted rounded-lg">
//                       <div className="flex items-center justify-between">
//                         <p className="font-medium">{review.user.name}</p>
//                         <p className="text-sm text-muted-foreground">
//                           {review.rating} ★
//                         </p>
//                       </div>
//                       <p className="text-sm text-muted-foreground mt-1">
//                         {review.comment}
//                       </p>
//                       <p className="text-xs text-muted-foreground mt-1">
//                         {new Date(review.createdAt).toLocaleDateString()}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <h3 className="font-medium mb-3 flex items-center gap-2">
//                   <Send className="w-4 h-4" />
//                   Recent B2B Requests
//                 </h3>
//                 <div className="space-y-2">
//                   {dashboardData.recentB2BRequests.map((request) => (
//                     <div key={request._id} className="p-2 bg-muted rounded-lg">
//                       <div className="flex items-center justify-between">
//                         <p className="font-medium">{request.companyName}</p>
//                         <p className="text-xs text-muted-foreground">
//                           {request.contactName}
//                         </p>
//                       </div>
//                       <p className="text-sm text-muted-foreground">
//                         {request.inquiryType}
//                       </p>
//                       <p className="text-xs text-muted-foreground mt-1">
//                         {new Date(request.createdAt).toLocaleDateString()}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import ConfirmDelete from "@/components/cards/confirmDelete";
import {
  Package,
  Star,
  Users,
  Send,
  Mail,
  MessageSquare,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

/* ===================== Types (match your backend) ===================== */
interface Review {
  _id: string;
  rating: number;
  comment: string;
  user: { _id: string; name: string };
  package: { _id: string };
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
interface PackageType {
  _id: string;
  title: string;
  location: { city: string; state: string; destination: string };
  duration: { day: number; night: number };
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
  popularPackages: PackageType[];
}

/* ===================== Helpers ===================== */
const glass =
  "rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl";

const subGlass =
  "rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors";

const COLORS = ["#22c55e", "#3b82f6", "#facc15", "#f97316", "#ef4444"];

const initialsFrom = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/* ===================== Component ===================== */
export default function Dashboard() {
  const [now, setNow] = useState<Date>(new Date());
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

  /* Live clock */
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  /* Fetch dashboard data */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/info");
        setDashboardData(res.data as DashboardData);
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
      }
    })();
  }, []);

  /* Chart data */
  const reviewChartData = useMemo(
    () => [
      { name: "5★", value: dashboardData.reviewStats.fiveStars },
      { name: "4★", value: dashboardData.reviewStats.fourStars },
      { name: "3★", value: dashboardData.reviewStats.threeStars },
      { name: "2★", value: dashboardData.reviewStats.twoStars },
      { name: "1★", value: dashboardData.reviewStats.oneStar },
    ],
    [dashboardData.reviewStats]
  );

  /* Simple month distribution for inquiries (client-side aggregate) */
  const inquiriesByMonth = useMemo(() => {
    const counts: Record<string, number> = {};
    dashboardData.recentInquiries.forEach((i) => {
      const d = new Date(i.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([k, v]) => ({ month: k, count: v }));
  }, [dashboardData.recentInquiries]);

  /* Delete an inquiry (uses your ConfirmDelete contract) */
  const deleteInquiry = async (id: string) => {
    await api.delete(`/inquiries/${id}`);
    setDashboardData((prev) => ({
      ...prev,
      totalInquiries: Math.max(0, prev.totalInquiries - 1),
      recentInquiries: prev.recentInquiries.filter((i) => i._id !== id),
    }));
  };

  return (
    <div className="min-h-screen p-5 md:p-8 bg-[#0b0d13] text-white">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <div className={`${glass} px-4 py-2 text-sm text-gray-300`}>
          {now.toLocaleString(undefined, {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
      </div>

      {/* Overview + Review stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overview cards */}
        <Card className={`${glass} lg:col-span-2`}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="w-5 h-5 text-primary" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Users", value: dashboardData.totalUsers, icon: Users },
              {
                label: "Packages",
                value: dashboardData.totalPackages,
                icon: Package,
              },
              {
                label: "Inquiries",
                value: dashboardData.totalInquiries,
                icon: MessageSquare,
              },
              {
                label: "B2B",
                value: dashboardData.totalB2BRequests,
                icon: Send,
              },
              {
                label: "Contacts",
                value: dashboardData.totalContacts,
                icon: Mail,
              },
              {
                label: "Reviews",
                value: dashboardData.totalReviews,
                icon: Star,
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className={`${subGlass} p-4 flex items-center gap-3`}
                >
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Review statistics */}
        <Card className={`${glass}`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5 text-yellow-400" />
              Review Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-center mb-2">
              <div className="text-4xl font-bold text-yellow-400">
                {dashboardData.reviewStats.averageRating.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">Average Rating</div>
            </div>

            <div className={`${subGlass} p-3`}>
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={reviewChartData}
                    dataKey="value"
                    outerRadius={75}
                    label
                  >
                    {reviewChartData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "none",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inquiries table (like your screenshot) */}
      <div className={`${glass} mt-6`}>
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-lg font-semibold">Recent Inquiries</h2>
          <div className="text-xs text-gray-400">
            Showing {Math.min(10, dashboardData.recentInquiries.length)} of{" "}
            {dashboardData.totalInquiries}
          </div>
        </div>

        <div className="px-3 pb-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="py-3 px-2">#</th>
                  <th className="py-3 px-2">Name</th>
                  <th className="py-3 px-2">Destination</th>
                  <th className="py-3 px-2">Date Added</th>
                  <th className="py-3 px-2">Message</th>
                  <th className="py-3 px-2 text-right">Operation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {dashboardData.recentInquiries.slice(0, 10).map((inq, idx) => (
                  <tr
                    key={inq._id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-2 text-gray-300">#{idx + 1}</td>

                    {/* Name + avatar initials */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 grid place-items-center border border-white/10">
                          <span className="text-xs text-gray-200">
                            {initialsFrom(inq.name)}
                          </span>
                        </div>
                        <div className="truncate">
                          <div className="font-medium text-gray-100 truncate">
                            {inq.name}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {inq.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Destination */}
                    <td className="py-3 px-2">
                      <div className="inline-flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span className="text-gray-200">{inq.destination}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-2 text-gray-300">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </td>

                    {/* Message snippet */}
                    <td className="py-3 px-2 max-w-[360px]">
                      <div className="text-gray-300 line-clamp-1">
                        {inq.message}
                      </div>
                    </td>

                    {/* Operation: Delete */}
                    <td className="py-3 px-2 text-right">
                      <ConfirmDelete
                        title="Inquiry"
                        onConfirm={() => deleteInquiry(inq._id)}
                      />
                    </td>
                  </tr>
                ))}

                {dashboardData.recentInquiries.length === 0 && (
                  <tr>
                    <td className="py-6 text-center text-gray-400" colSpan={6}>
                      No inquiries yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Analytics & other sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Inquiries trend (bar) */}
        <Card className={`${glass}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Inquiries Trend</CardTitle>
          </CardHeader>
          <CardContent className={`${subGlass} p-3`}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={inquiriesByMonth}>
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", border: "none" }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Reviews (compact list) */}
        <Card className={`${glass}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.recentReviews.slice(0, 6).map((r) => (
              <div key={r._id} className={`${subGlass} p-3`}>
                <div className="flex items-center justify-between">
                  <div className="font-medium">{r.user?.name ?? "User"}</div>
                  <div className="text-sm text-gray-400">{r.rating} ★</div>
                </div>
                {r.comment && (
                  <div className="text-sm text-gray-300 line-clamp-2 mt-1">
                    {r.comment}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {dashboardData.recentReviews.length === 0 && (
              <div className="text-sm text-gray-400">No reviews yet.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Popular Packages (table style, read-only) */}
      <div className={`${glass} mt-6`}>
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-lg font-semibold">Popular Packages</h2>
          <div className="text-xs text-gray-400">
            {dashboardData.popularPackages.length} items
          </div>
        </div>

        <div className="px-3 pb-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="py-3 px-2">Rank</th>
                  <th className="py-3 px-2">Title</th>
                  <th className="py-3 px-2">Destination</th>
                  <th className="py-3 px-2">Duration</th>
                  <th className="py-3 px-2">Price</th>
                  <th className="py-3 px-2">Reviews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {dashboardData.popularPackages.slice(0, 6).map((p, idx) => (
                  <tr
                    key={p._id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-2 text-gray-300">#{idx + 1}</td>
                    <td className="py-3 px-2 text-gray-100">{p.title}</td>
                    <td className="py-3 px-2 text-gray-200">
                      {p.location?.destination ||
                        [p.location?.city, p.location?.state]
                          .filter(Boolean)
                          .join(", ")}
                    </td>
                    <td className="py-3 px-2 text-gray-300">
                      {p.duration?.day ?? 0}d / {p.duration?.night ?? 0}n
                    </td>
                    <td className="py-3 px-2 text-gray-100">
                      {typeof p.price === "number"
                        ? `₹${p.price.toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="py-3 px-2 text-gray-300">
                      {p.reviews?.length ?? 0}
                    </td>
                  </tr>
                ))}
                {dashboardData.popularPackages.length === 0 && (
                  <tr>
                    <td className="py-6 text-center text-gray-400" colSpan={6}>
                      No packages to show.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* B2B Requests */}
      <div className={`${glass} mt-6`}>
        <div className="p-5 pb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" /> Recent B2B Requests
          </h2>
        </div>
        <div className="px-5 pb-5 grid gap-3 md:grid-cols-2">
          {dashboardData.recentB2BRequests.slice(0, 6).map((b2b) => (
            <div key={b2b._id} className={`${subGlass} p-4`}>
              <div className="flex items-center justify-between">
                <div className="font-medium">{b2b.companyName}</div>
                <div className="text-xs text-gray-400">
                  {new Date(b2b.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="text-sm text-gray-300 mt-1">
                {b2b.inquiryType}
              </div>
              <div className="text-xs text-gray-400">{b2b.contactName}</div>
              {b2b.message && (
                <div className="text-xs text-gray-400 mt-2 line-clamp-2">
                  {b2b.message}
                </div>
              )}
            </div>
          ))}
          {dashboardData.recentB2BRequests.length === 0 && (
            <div className="text-sm text-gray-400 px-5 pb-5">
              No B2B requests yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

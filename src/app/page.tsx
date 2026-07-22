"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import ConfirmDelete from "@/components/cards/confirmDelete";
import Link from "next/link";
import {
  Package,
  Star,
  Users,
  Send,
  Mail,
  MessageSquare,
  MapPin,
  TrendingUp,
  Plus,
  Calendar,
  Building2,
  Sparkles,
  ArrowUpRight,
  Eye,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

/* ===================== Types ===================== */
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

const initialsFrom = (name: string) =>
  name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "NA";

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

  /* Live Clock */
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  /* Fetch Dashboard Data */
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

  /* Inquiries aggregate by month for chart */
  const inquiriesByMonth = useMemo(() => {
    const counts: Record<string, number> = {};
    dashboardData.recentInquiries.forEach((i) => {
      const d = new Date(i.createdAt);
      const key = `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([k, v]) => ({ date: k, inquiries: v }));
  }, [dashboardData.recentInquiries]);

  const deleteInquiry = async (id: string) => {
    await api.delete(`/inquiries/${id}`);
    setDashboardData((prev) => ({
      ...prev,
      totalInquiries: Math.max(0, prev.totalInquiries - 1),
      recentInquiries: prev.recentInquiries.filter((i) => i._id !== id),
    }));
  };

  /* Metric Card Definitions */
  const statCards = [
    {
      title: "Total Users",
      value: dashboardData.totalUsers,
      icon: Users,
      color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400",
      iconBg: "bg-blue-500/20 text-blue-400",
      trend: "Active customers",
    },
    {
      title: "Tour Packages",
      value: dashboardData.totalPackages,
      icon: Package,
      color: "from-indigo-500/20 to-violet-500/10 border-indigo-500/30 text-indigo-400",
      iconBg: "bg-indigo-500/20 text-indigo-400",
      trend: "Published packages",
    },
    {
      title: "Travel Inquiries",
      value: dashboardData.totalInquiries,
      icon: MessageSquare,
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
      iconBg: "bg-emerald-500/20 text-emerald-400",
      trend: "Customer leads",
    },
    {
      title: "B2B Partner Requests",
      value: dashboardData.totalB2BRequests,
      icon: Building2,
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
      iconBg: "bg-amber-500/20 text-amber-400",
      trend: "Agency inquiries",
    },
    {
      title: "Direct Messages",
      value: dashboardData.totalContacts,
      icon: Mail,
      color: "from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400",
      iconBg: "bg-rose-500/20 text-rose-400",
      trend: "Contact submissions",
    },
    {
      title: "Customer Reviews",
      value: dashboardData.totalReviews,
      icon: Star,
      color: "from-yellow-500/20 to-amber-500/10 border-yellow-500/30 text-yellow-400",
      iconBg: "bg-yellow-500/20 text-yellow-400",
      trend: "Ratings received",
    },
  ];

  const totalReviewsCount = dashboardData.totalReviews || 1;
  const starBreakdown = [
    { stars: 5, count: dashboardData.reviewStats.fiveStars },
    { stars: 4, count: dashboardData.reviewStats.fourStars },
    { stars: 3, count: dashboardData.reviewStats.threeStars },
    { stars: 2, count: dashboardData.reviewStats.twoStars },
    { stars: 1, count: dashboardData.reviewStats.oneStar },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* ── Welcome Banner Header ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-primary/20 to-slate-900 border border-border/80 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> TripToo Admin Control Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Welcome back, Admin 👋
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Here is your agency overview. Track customer inquiries, package listings, and review analytics in real time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-card/80 backdrop-blur-md border border-border/80 text-xs font-medium text-muted-foreground flex items-center gap-2 shadow-xs">
              <Calendar className="w-4 h-4 text-primary" />
              <span>
                {now.toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
            <Link
              href="/packages/new"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-4 py-2 rounded-2xl text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" /> Add Package
            </Link>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Grid (6 Tiles) ──────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Overview Metrics
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${card.color} p-5 shadow-xs hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {card.title}
                    </p>
                    <p className="text-3xl font-black text-foreground tracking-tight">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-medium">{card.trend}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Analytics & Review Breakdown Row ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Review Rating Breakdown Card */}
        <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center font-bold">
                <Star className="w-4 h-4 fill-yellow-400" />
              </div>
              <h3 className="text-base font-bold text-foreground">Rating Summary</h3>
            </div>
            <span className="text-xs text-muted-foreground font-semibold">
              {dashboardData.totalReviews} reviews
            </span>
          </div>

          <div className="py-6 flex items-center gap-6 justify-center">
            <div className="text-center">
              <span className="text-5xl font-black text-foreground tracking-tight">
                {dashboardData.reviewStats.averageRating.toFixed(1)}
              </span>
              <div className="flex items-center justify-center gap-1 mt-1 text-yellow-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(dashboardData.reviewStats.averageRating)
                        ? "fill-yellow-400"
                        : "text-muted opacity-40"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Average Rating</p>
            </div>
          </div>

          {/* Star Rating Distribution Bars */}
          <div className="space-y-2.5 pt-2">
            {starBreakdown.map(({ stars, count }) => {
              const pct = Math.round((count / totalReviewsCount) * 100);
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <div className="w-12 font-semibold text-muted-foreground flex items-center gap-1">
                    <span>{stars}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  </div>

                  <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="w-8 text-right font-bold text-foreground">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inquiries Trend Chart Card */}
        <div className="lg:col-span-2 bg-card border border-border/60 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Inquiries Trend</h3>
                <p className="text-xs text-muted-foreground">Recent lead volume by date</p>
              </div>
            </div>
          </div>

          <div className="pt-6 h-56 w-full">
            {inquiriesByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inquiriesByMonth}>
                  <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#ffffff",
                    }}
                  />
                  <Bar dataKey="inquiries" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs">
                <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                No inquiry trend data available yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Inquiries Table Section ──────────────────────────────── */}
      <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-6 border-b border-border/40 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Recent Customer Inquiries</h3>
              <p className="text-xs text-muted-foreground">Latest trip quote requests and customer messages</p>
            </div>
          </div>
          <span className="text-xs font-semibold bg-muted px-3 py-1 rounded-full text-muted-foreground">
            Showing {Math.min(10, dashboardData.recentInquiries.length)} of {dashboardData.totalInquiries}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border/40 text-muted-foreground bg-muted/30 font-semibold">
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-4">Destination</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Message</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 font-medium">
              {dashboardData.recentInquiries.slice(0, 10).map((inq) => (
                <tr key={inq._id} className="hover:bg-muted/40 transition-colors">
                  {/* Customer Info */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 text-primary font-bold flex items-center justify-center text-xs shadow-xs">
                        {initialsFrom(inq.name)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm line-clamp-1">{inq.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{inq.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Destination */}
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20">
                      <MapPin className="w-3 h-3" />
                      {inq.destination}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 text-muted-foreground text-xs">
                    {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  {/* Message */}
                  <td className="py-4 px-4 max-w-xs">
                    <p className="text-xs text-muted-foreground/90 line-clamp-1">
                      {inq.message || "No special message provided."}
                    </p>
                  </td>

                  {/* Delete Action */}
                  <td className="py-4 px-6 text-right">
                    <ConfirmDelete
                      title="Inquiry"
                      onConfirm={() => deleteInquiry(inq._id)}
                      className="h-8 px-2.5 rounded-xl text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-0 transition-colors cursor-pointer"
                    />
                  </td>
                </tr>
              ))}

              {dashboardData.recentInquiries.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground text-xs">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-60" />
                    No recent inquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── B2B & Popular Packages Double Row ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent B2B Requests */}
        <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">Recent B2B Partner Requests</h3>
            </div>
            <Link href="/b2b" className="text-xs font-semibold text-primary hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {dashboardData.recentB2BRequests.slice(0, 4).map((b2b) => (
              <div
                key={b2b._id}
                className="p-4 rounded-2xl bg-muted/40 border border-border/40 hover:bg-muted/70 transition-colors space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">{b2b.companyName}</span>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {new Date(b2b.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Contact: {b2b.contactName}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-semibold text-[10px]">
                    {b2b.inquiryType}
                  </span>
                </div>
              </div>
            ))}
            {dashboardData.recentB2BRequests.length === 0 && (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No B2B requests recorded yet.
              </p>
            )}
          </div>
        </div>

        {/* Popular Packages */}
        <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">Top Popular Packages</h3>
            </div>
            <Link href="/packages" className="text-xs font-semibold text-primary hover:underline">
              View Catalog
            </Link>
          </div>

          <div className="space-y-3">
            {dashboardData.popularPackages.slice(0, 4).map((pkg) => (
              <div
                key={pkg._id}
                className="p-3.5 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-between gap-3 hover:bg-muted/70 transition-colors"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-xs sm:text-sm text-foreground line-clamp-1">{pkg.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {pkg.location?.destination || pkg.location?.city} • {pkg.duration?.day}D/{pkg.duration?.night}N
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-extrabold text-sm text-foreground">
                    ₹{Math.round(pkg.price).toLocaleString("en-IN")}
                  </p>
                  <Link
                    href={`/packages/edit/${pkg._id}`}
                    className="inline-flex items-center gap-1 text-[10px] text-primary font-semibold hover:underline"
                  >
                    Edit <Eye className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
            {dashboardData.popularPackages.length === 0 && (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No popular packages found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

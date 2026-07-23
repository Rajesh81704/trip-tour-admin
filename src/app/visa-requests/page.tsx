"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  FileCheck,
  Search,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  Globe,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface VisaInquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  visaType: string;
  passportNumber?: string;
  travelDate?: string;
  message?: string;
  status: "pending" | "in-review" | "approved" | "rejected";
  createdAt: string;
}

export default function VisaRequestsPage() {
  const [requests, setRequests] = useState<VisaInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ success: boolean; visaInquiries: VisaInquiry[] }>("/visa/inquiries");
      if (res.data.success) {
        setRequests(res.data.visaInquiries);
      }
    } catch (err) {
      console.error("Error fetching visa requests:", err);
      toast.error("Failed to load visa requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await api.patch(`/visa/inquiries/${id}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Visa status updated to ${newStatus}`);
        setRequests((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: newStatus as VisaInquiry["status"] } : r))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this visa request?")) return;
    try {
      const res = await api.delete(`/visa/inquiries/${id}`);
      if (res.data.success) {
        toast.success("Visa request deleted");
        setRequests((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete request");
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: VisaInquiry["status"]) => {
    switch (status) {
      case "approved":
        return <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case "rejected":
        return <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
      case "in-review":
        return <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> In Review</span>;
      default:
        return <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-amber-400" /> User Visa Requests &amp; Applications
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage raised user visa inquiries, update processing status, and review applicant details.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300">
          <span className="font-bold text-white">{requests.length}</span> Total Applications
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search applicant name, email, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-review">In Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading visa requests...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="py-16 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <FileCheck className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-bold text-white">No Visa Requests Found</h3>
          <p className="text-xs text-slate-400">User visa applications submitted on the website will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((req) => (
            <div
              key={req._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-4 shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-white text-base">{req.name}</h3>
                  </div>
                  <span className="inline-block bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                    {req.visaType}
                  </span>
                </div>
                {getStatusBadge(req.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Country: <strong className="text-white">{req.country}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{req.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span className="truncate">{req.email}</span>
                </div>
                {req.passportNumber && (
                  <div className="flex items-center gap-1.5">
                    <span>Passport: <strong className="text-white">{req.passportNumber}</strong></span>
                  </div>
                )}
                {req.travelDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-400" />
                    <span>Travel: <strong className="text-white">{req.travelDate}</strong></span>
                  </div>
                )}
              </div>

              {req.message && (
                <div className="text-xs text-slate-400 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-semibold text-slate-300">Message:</span> {req.message}
                </div>
              )}

              {/* Status Update & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">Update Status:</span>
                  <select
                    value={req.status}
                    onChange={(e) => handleStatusUpdate(req._id, e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(req._id)}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 px-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

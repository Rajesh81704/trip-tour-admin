"use client";

import ConfirmDelete from "@/components/cards/confirmDelete";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import {
  Building2,
  Calendar,
  FileQuestion,
  Globe,
  Mail,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

interface B2BRequest {
  _id: string;
  companyName: string;
  email: string;
  phone: string;
  website?: string;
  message: string;
  inquiryType: string;
  contactName?: string;
  createdAt: string;
}

export default function B2BPage() {
  const [b2bRequests, setB2BRequests] = useState<B2BRequest[]>([]);

  useEffect(() => {
    const fetchB2BRequests = async () => {
      try {
        const response = await api.get<{ data: B2BRequest[] }>("/b2b-requests");
        setB2BRequests(response.data.data);
      } catch (error) {
        console.error("Error fetching B2B requests:", error);
      }
    };

    fetchB2BRequests();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/b2b-requests/${id}`);
      setB2BRequests((prev) => prev.filter((request) => request._id !== id));
    } catch (error) {
      console.error("Error deleting B2B request:", error);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <h1 className="text-2xl font-bold text-neutral-100 mb-6">
          B2B Requests
        </h1>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {b2bRequests.map((request) => (
            <Card
              key={request._id}
              className="py-0 bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {/* Header */}
              <CardHeader className="border-b border-neutral-800 p-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-neutral-100 truncate max-w-[160px]">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  {request.companyName}
                </CardTitle>
                <p className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(request.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </CardHeader>

              {/* Content */}
              <CardContent className="space-y-2 p-3">
                <InfoRow
                  icon={<User className="w-4 h-4 text-cyan-400" />}
                  label="Contact"
                  value={request.contactName || "N/A"}
                />
                <InfoRow
                  icon={<Mail className="w-4 h-4 text-pink-400" />}
                  label="Email"
                  value={request.email}
                />
                <InfoRow
                  icon={<Phone className="w-4 h-4 text-blue-400" />}
                  label="Phone"
                  value={request.phone}
                />
                {request.website && (
                  <InfoRow
                    icon={<Globe className="w-4 h-4 text-emerald-400" />}
                    label="Website"
                    value={
                      <a
                        href={request.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {request.website}
                      </a>
                    }
                  />
                )}
                <InfoRow
                  icon={<FileQuestion className="w-4 h-4 text-amber-400" />}
                  label="Inquiry Type"
                  value={request.inquiryType}
                />
                <InfoRow
                  icon={<MessageSquare className="w-4 h-4 text-purple-400" />}
                  label="Message"
                  value={request.message}
                />

                {/* Delete */}
                <div className="pt-2 border-t border-neutral-800 mt-2">
                  <ConfirmDelete
                    onConfirm={() => handleDelete(request._id)}
                    title="B2B Request"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 p-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] uppercase font-medium text-neutral-500 tracking-wide">
          {label}
        </p>
        <p className="text-xs font-medium text-neutral-100 truncate max-w-[150px]">
          {value}
        </p>
      </div>
    </div>
  );
}

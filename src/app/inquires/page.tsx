"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { Mail, Phone, MapPin, MessageSquare, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import ConfirmDelete from "@/components/cards/confirmDelete";

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  destination: string;
  message: string;
  createdAt: string;
}

export default function Inquiry() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const response = await api.get<{ data: Inquiry[] }>("/inquiries");
        setInquiries(response.data.data);
      } catch (error) {
        console.error("Failed to fetch inquiries:", error);
      }
    };
    fetchInquiries();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/inquiries/${id}`);
      setInquiries((prev) => prev.filter((inq) => inq._id !== id));
    } catch (error) {
      console.error("Failed to delete inquiry:", error);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
      {/* Header */}
      <div className="mb-6 text-center md:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-100">
          Customer Inquiries
        </h1>
        <p className="text-neutral-400 text-sm">
          Quick view of your latest leads
        </p>
      </div>

      {/* Compact Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {inquiries.map((inq) => (
          <Card
            key={inq._id}
            className=" py-0 shadow-lg hover:shadow-xl transition-all border border-neutral-800 rounded-xl bg-neutral-900"
          >
            {/* Header */}
            <CardHeader className="border-b border-neutral-800 p-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-semibold text-neutral-100 truncate max-w-[140px]">
                  {inq.name}
                </CardTitle>
                <div className="flex items-center text-neutral-500 text-xs">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {new Date(inq.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="space-y-2 p-3">
              <InfoRow
                icon={<Phone className="w-4 h-4 text-blue-400" />}
                label="Phone"
                value={inq.mobileNumber}
              />
              <InfoRow
                icon={<Mail className="w-4 h-4 text-pink-400" />}
                label="Email"
                value={inq.email}
              />
              <InfoRow
                icon={<MapPin className="w-4 h-4 text-emerald-400" />}
                label="Destination"
                value={inq.destination}
              />
              <InfoRow
                icon={<MessageSquare className="w-4 h-4 text-amber-400" />}
                label="Message"
                value={inq.message}
              />

              {/* Delete */}
              <div className="pt-2">
                <ConfirmDelete
                  onConfirm={() => handleDelete(inq._id)}
                  title="Inquiry"
                />
              </div>
            </CardContent>
          </Card>
        ))}
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
  value: string;
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

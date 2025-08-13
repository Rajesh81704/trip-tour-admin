"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

export default function Inquiry() {
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const response = await api.get("/inquiries");
        // API returns { success: true, data: [...] }
        setInquiries(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch inquiries:", error);
      }
    };
    fetchInquiries();
  }, []);

  return (
    <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3 bg-gray-900 min-h-screen">
      {inquiries.map((inq) => (
        <Card
          key={inq._id}
          className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-800 to-gray-900 
          shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-100">
              {inq.name}
            </CardTitle>
            <p className="text-sm text-gray-400">
              {new Date(inq.createdAt).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <Phone size={16} className="text-blue-400" /> {inq.mobileNumber}
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Mail size={16} className="text-red-400" /> {inq.email}
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin size={16} className="text-green-400" /> {inq.destination}
            </div>
            <div className="flex items-start gap-2 text-gray-300">
              <MessageSquare size={16} className="text-purple-400 mt-0.5" />{" "}
              <span>{inq.message}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";
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
      setInquiries(inquiries.filter((inq) => inq._id !== id));
    } catch (error) {
      console.error("Failed to delete inquiry:", error);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Inquiries</h1>
        <p className="text-muted-foreground">Manage customer inquiries</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {inquiries.map((inq) => (
          <Card key={inq._id} className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">{inq.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {new Date(inq.createdAt).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-2 bg-background rounded-lg">
                <Phone className="w-5 h-5" />
                <div>
                  <p className="text-sm text-foreground/60">Phone</p>
                  <p className="font-medium">{inq.mobileNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-background rounded-lg">
                <Mail className="w-5 h-5" />
                <div>
                  <p className="text-sm text-foreground/60">Email</p>
                  <p className="font-medium">{inq.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-background rounded-lg">
                <MapPin className="w-5 h-5" />
                <div>
                  <p className="text-sm text-foreground/60">Destination</p>
                  <p className="font-medium">{inq.destination}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 bg-background rounded-lg">
                <MessageSquare className="w-5 h-5 mt-1" />
                <div>
                  <p className="text-sm text-foreground/60">Message</p>
                  <p className="font-medium">{inq.message}</p>
                </div>
              </div>
              <ConfirmDelete
                onConfirm={() => handleDelete(inq._id)}
                title="Inquiry"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

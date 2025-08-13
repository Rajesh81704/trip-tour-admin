"use client";

import ConfirmDelete from "@/components/cards/confirmDelete";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const backendUrl = process.env.NEXT_PUBLIC_DEV_BACKEND_URL;

  useEffect(() => {
    const fetchB2BRequests = async () => {
      try {
        const response = await fetch(`${backendUrl}/b2b-requests`);
        const data = await response.json();
        if (data.success) {
          setB2BRequests(data.data);
        }
      } catch (error) {
        console.error("Error fetching B2B requests:", error);
      }
    };

    fetchB2BRequests();
  }, [backendUrl]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${backendUrl}/b2b-requests/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setB2BRequests(b2bRequests.filter((request) => request._id !== id));
      }
    } catch (error) {
      console.error("Error deleting B2B request:", error);
    }
  };

  return (
    <div className="min-h-screenp-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          B2B Requests
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {b2bRequests.map((request) => (
            <Card
              key={request._id}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Building2 className="w-6 h-6" />
                  {request.companyName}
                </CardTitle>
                <p className="flex items-center gap-2 text-sm text-foreground/60 mt-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(request.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 p-2 bg-background rounded-lg">
                    <User className="w-5 h-5" />
                    <div>
                      <p className="text-sm text-foreground/60">
                        Contact Person
                      </p>
                      <p className="font-medium">
                        {request.contactName || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 bg-background rounded-lg">
                    <Mail className="w-5 h-5" />
                    <div>
                      <p className="text-sm text-foreground/60">Email</p>
                      <p className="font-medium">{request.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 bg-background rounded-lg">
                    <Phone className="w-5 h-5" />
                    <div>
                      <p className="text-sm text-foreground/60">Phone</p>
                      <p className="font-medium">{request.phone}</p>
                    </div>
                  </div>

                  {request.website && (
                    <div className="flex items-center gap-3 p-2 bg-background rounded-lg">
                      <Globe className="w-5 h-5" />
                      <div>
                        <p className="text-sm text-foreground/60">Website</p>
                        <a
                          href={request.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:text-foreground/80"
                        >
                          {request.website}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-2 bg-background rounded-lg">
                    <FileQuestion className="w-5 h-5" />
                    <div>
                      <p className="text-sm text-foreground/60">Inquiry Type</p>
                      <p className="font-medium">{request.inquiryType}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2 bg-background rounded-lg">
                    <MessageSquare className="w-5 h-5 mt-1" />
                    <div>
                      <p className="text-sm text-foreground/60">Message</p>
                      <p className="font-medium">{request.message}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t mt-4">
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

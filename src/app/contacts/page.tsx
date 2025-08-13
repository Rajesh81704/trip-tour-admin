"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { Mail, Phone, MessageSquare, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import ConfirmDelete from "@/components/cards/confirmDelete";

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await api.get<{ data: Contact[] }>("/contacts");
        setContacts(response.data.data);
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      }
    };
    fetchContacts();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/contacts/${id}`);
      setContacts((prev) => prev.filter((contact) => contact._id !== id));
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-100">
          Contact Messages
        </h1>
        <p className="text-neutral-400 text-sm">
          Manage contact form submissions
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {contacts.map((contact) => (
          <Card
            key={contact._id}
            className=" py-0 bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <CardHeader className="border-b border-neutral-800 p-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-semibold text-neutral-100 truncate max-w-[140px]">
                  {contact.name}
                </CardTitle>
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(contact.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-2 p-3">
              <InfoRow
                icon={<Mail className="w-4 h-4 text-pink-400" />}
                label="Email"
                value={contact.email}
              />
              {contact.phone && (
                <InfoRow
                  icon={<Phone className="w-4 h-4 text-blue-400" />}
                  label="Phone"
                  value={contact.phone}
                />
              )}
              <InfoRow
                icon={<MessageSquare className="w-4 h-4 text-amber-400" />}
                label="Subject"
                value={contact.subject}
              />
              <InfoRow
                icon={<MessageSquare className="w-4 h-4 text-purple-400" />}
                label="Message"
                value={contact.message}
              />

              <div className="pt-2 border-t border-neutral-800 mt-2">
                <ConfirmDelete
                  onConfirm={() => handleDelete(contact._id)}
                  title="Contact Message"
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
        <p className="text-xs font-medium text-neutral-100 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

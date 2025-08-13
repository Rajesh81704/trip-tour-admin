"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { Mail, Phone, MessageSquare } from "lucide-react";
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
      setContacts(contacts.filter((contact) => contact._id !== id));
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Contact Messages</h1>
        <p className="text-muted-foreground">Manage contact form submissions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <Card key={contact._id} className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">{contact.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {new Date(contact.createdAt).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-2 bg-background rounded-lg">
                <Mail className="w-5 h-5" />
                <div>
                  <p className="text-sm text-foreground/60">Email</p>
                  <p className="font-medium">{contact.email}</p>
                </div>
              </div>

              {contact.phone && (
                <div className="flex items-center gap-3 p-2 bg-background rounded-lg">
                  <Phone className="w-5 h-5" />
                  <div>
                    <p className="text-sm text-foreground/60">Phone</p>
                    <p className="font-medium">{contact.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-2 bg-background rounded-lg">
                <MessageSquare className="w-5 h-5 mt-1" />
                <div>
                  <p className="text-sm text-foreground/60">Subject</p>
                  <p className="font-medium">{contact.subject}</p>
                  <p className="text-sm text-foreground/60 mt-2">Message</p>
                  <p className="font-medium">{contact.message}</p>
                </div>
              </div>

              <ConfirmDelete
                onConfirm={() => handleDelete(contact._id)}
                title="Contact Message"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

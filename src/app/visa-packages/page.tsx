"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Globe,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Sparkles,
  Loader2,
  X,
  Clock,
  Calendar,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export interface VisaPackage {
  _id: string;
  country: string;
  flag: string;
  visaType: string;
  processingTime: string;
  validity: string;
  price: string;
  popular: boolean;
  isActive: boolean;
  description?: string;
  createdAt: string;
}

export default function VisaPackagesAdminPage() {
  const [packages, setPackages] = useState<VisaPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<VisaPackage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    country: "",
    flag: "🌐",
    visaType: "Tourist Visa",
    processingTime: "",
    validity: "",
    price: "",
    popular: false,
    isActive: true,
  });

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ success: boolean; visaPackages: VisaPackage[] }>("/visa/packages/all");
      if (res.data && res.data.visaPackages) {
        setPackages(res.data.visaPackages);
      }
    } catch (err) {
      console.error("Error fetching visa packages:", err);
      toast.error("Failed to load visa packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleOpenAddModal = () => {
    setEditingPackage(null);
    setForm({
      country: "",
      flag: "🌐",
      visaType: "Tourist Visa",
      processingTime: "2 - 4 Days",
      validity: "30 Days",
      price: "₹4,999",
      popular: false,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (pkg: VisaPackage) => {
    setEditingPackage(pkg);
    setForm({
      country: pkg.country,
      flag: pkg.flag || "🌐",
      visaType: pkg.visaType,
      processingTime: pkg.processingTime,
      validity: pkg.validity,
      price: pkg.price,
      popular: pkg.popular,
      isActive: pkg.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingPackage) {
        // Update
        const res = await api.put<{ success: boolean; message: string }>(`/visa/packages/${editingPackage._id}`, form);
        if (res.data.success) {
          toast.success("Visa package updated successfully!");
          setShowModal(false);
          fetchPackages();
        }
      } else {
        // Create
        const res = await api.post<{ success: boolean; message: string }>("/visa/packages", form);
        if (res.data.success || res.status === 201) {
          toast.success("Visa package created successfully!");
          setShowModal(false);
          fetchPackages();
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save visa package");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, country: string) => {
    if (!confirm(`Are you sure you want to delete the visa package for "${country}"?`)) return;
    try {
      const res = await api.delete<{ success: boolean }>(`/visa/packages/${id}`);
      if (res.data.success) {
        toast.success(`Visa package for ${country} deleted`);
        setPackages((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete visa package");
    }
  };

  const togglePopular = async (pkg: VisaPackage) => {
    try {
      const updatedPopular = !pkg.popular;
      const res = await api.put<{ success: boolean }>(`/visa/packages/${pkg._id}`, { popular: updatedPopular });
      if (res.data.success) {
        toast.success(`${pkg.country} marked as ${updatedPopular ? "Popular" : "Standard"}`);
        setPackages((prev) =>
          prev.map((p) => (p._id === pkg._id ? { ...p, popular: updatedPopular } : p))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const toggleActive = async (pkg: VisaPackage) => {
    try {
      const updatedActive = !pkg.isActive;
      const res = await api.put<{ success: boolean }>(`/visa/packages/${pkg._id}`, { isActive: updatedActive });
      if (res.data.success) {
        toast.success(`${pkg.country} ${updatedActive ? "Activated" : "Deactivated"}`);
        setPackages((prev) =>
          prev.map((p) => (p._id === pkg._id ? { ...p, isActive: updatedActive } : p))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const filteredPackages = packages.filter(
    (p) =>
      p.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.visaType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Globe className="w-7 h-7 text-amber-400" /> Visa Packages Management
            </h1>
            <p className="text-sm text-slate-400">
              Create, edit, and manage visa destinations displayed on the customer web portal.
            </p>
          </div>
          <Button
            onClick={handleOpenAddModal}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Visa Package
          </Button>
        </div>

        {/* Search */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by country or visa type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Loading Visa Packages...</span>
          </div>
        ) : filteredPackages.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800 text-center py-12">
            <CardContent className="space-y-3">
              <Globe className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-slate-400">No visa packages found.</p>
              <Button onClick={handleOpenAddModal} variant="outline" className="mt-2">
                Create First Package
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <Card
                key={pkg._id}
                className="bg-slate-900 border-slate-800 text-slate-100 flex flex-col justify-between relative overflow-hidden shadow-lg hover:border-slate-700 transition-colors"
              >
                <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{pkg.flag}</span>
                    <div>
                      <CardTitle className="text-lg font-bold text-white">{pkg.country}</CardTitle>
                      <p className="text-xs text-slate-400">{pkg.visaType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {pkg.popular && (
                      <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        Popular
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        pkg.isActive
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {pkg.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-3 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Processing:
                    </span>
                    <span className="font-semibold">{pkg.processingTime}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" /> Validity:
                    </span>
                    <span className="font-semibold">{pkg.validity}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-amber-400" /> Starting Price:
                    </span>
                    <span className="text-base font-bold text-amber-400">{pkg.price}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePopular(pkg)}
                        className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition-colors ${
                          pkg.popular
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        ★ {pkg.popular ? "Popular" : "Set Popular"}
                      </button>
                      <button
                        onClick={() => toggleActive(pkg)}
                        className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition-colors ${
                          pkg.isActive
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        }`}
                      >
                        {pkg.isActive ? "Hide" : "Show"}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenEditModal(pkg)}
                        className="h-8 w-8 text-slate-300 hover:text-amber-400 hover:bg-slate-800"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(pkg._id, pkg.country)}
                        className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-400" />
                  {editingPackage ? `Edit Visa Package: ${editingPackage.country}` : "Add New Visa Package"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <label className="font-semibold text-slate-300">Country Name *</label>
                    <Input
                      required
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      placeholder="e.g. Japan"
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">Flag Emoji / Icon</label>
                    <Input
                      value={form.flag}
                      onChange={(e) => setForm({ ...form, flag: e.target.value })}
                      placeholder="e.g. 🇯🇵"
                      className="bg-slate-950 border-slate-800 text-white text-center text-base"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Visa Type / Category *</label>
                  <Input
                    required
                    value={form.visaType}
                    onChange={(e) => setForm({ ...form, visaType: e.target.value })}
                    placeholder="e.g. E-Visa / Tourist & Express"
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">Processing Time *</label>
                    <Input
                      required
                      value={form.processingTime}
                      onChange={(e) => setForm({ ...form, processingTime: e.target.value })}
                      placeholder="e.g. 24 - 48 Hours"
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">Validity *</label>
                    <Input
                      required
                      value={form.validity}
                      onChange={(e) => setForm({ ...form, validity: e.target.value })}
                      placeholder="e.g. 30 / 60 Days"
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Starting Price *</label>
                  <Input
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="e.g. ₹4,999"
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={form.popular}
                      onChange={(e) => setForm({ ...form, popular: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                    />
                    Mark as Popular
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                    />
                    Active & Visible
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Saving...
                      </>
                    ) : editingPackage ? (
                      "Update Visa Package"
                    ) : (
                      "Create Visa Package"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}

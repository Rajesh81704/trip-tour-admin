"use client";

import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { logout } from "@/store/slice";
import {
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Plus,
  Send,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";

const sidebarLinks = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Create Package",
    href: "/packages/new",
    icon: Plus,
  },
  {
    name: "Packages",
    href: "/packages",
    icon: Package,
  },
  {
    name: "B2B Requests",
    href: "/b2b",
    icon: Send,
  },
  {
    name: "Contacts",
    href: "/contacts",
    icon: Mail,
  },
  {
    name: "Inquiries",
    href: "/inquires",
    icon: Send,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await api.post("/auth/admin/logout", {});
    dispatch(logout());
    router.push("/auth/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen relative">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        className="lg:hidden fixed top-4 left-4 z-50 bg-white"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6 text-black" />
        ) : (
          <Menu className="w-6 h-6 text-black" />
        )}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static w-64 bg-background border-r flex flex-col justify-between h-full transition-transform duration-300 z-40",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div>
          <div className="p-6 font-bold text-xl flex items-center gap-2">
            <Home className="w-6 h-6" />
            Admin Panel
          </div>
          <nav className="mt-4 flex flex-col gap-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-6 mx-2 py-3 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-muted text-primary"
                      : "text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-6">
          <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
    </div>
  );
}

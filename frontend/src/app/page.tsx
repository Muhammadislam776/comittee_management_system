"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { HeadDashboard } from "@/components/dashboards/HeadDashboard";
import { MemberDashboard } from "@/components/dashboards/MemberDashboard";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Render dashboard based on role
  if (user.role === "admin") {
    return <AdminDashboard />;
  }

  if (user.role === "committee_head") {
    return <HeadDashboard />;
  }

  // Default to Member dashboard for 'member' or any unknown role
  return <MemberDashboard />;
}

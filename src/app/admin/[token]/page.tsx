import { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "管理画面 - 倍速アンケート",
  robots: { index: false, follow: false },
};

interface AdminPageProps {
  params: Promise<{ token: string }>;
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { token } = await params;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <AdminDashboard token={token} />
      </div>
    </main>
  );
}

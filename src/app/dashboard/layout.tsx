import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) redirect("/");

  return (
    <div className="min-h-screen md:pl-64">
      <Sidebar userName={user.name} />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}

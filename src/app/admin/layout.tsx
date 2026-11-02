import { AdminNav } from "@/components/admin-nav";
import { SiteHeader } from "@/components/site-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 sm:px-10">
      <SiteHeader />
      <div className="grid flex-1 gap-8 py-10 md:grid-cols-[12rem_minmax(0,1fr)] sm:py-14">
        <aside className="border-b pb-6 md:border-r md:border-b-0 md:pr-6 md:pb-0">
          <AdminNav />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

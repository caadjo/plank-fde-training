import { SiteHeader } from "@/components/site-header";

export default function RequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 sm:px-10">
      <SiteHeader />
      {children}
    </div>
  );
}

// app/(application)/layout.tsx

import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { PropsWithChildren } from "react";

export default function ApplicationLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-[100dvh] grid grid-rows-[auto_1fr_auto]">
      {/* Add your application-specific layout components */}
      <SiteHeader />
      <div className="">{children}</div>

      <SiteFooter />
    </div>
  );
}

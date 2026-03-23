import { Suspense } from "react";
import ConfirmedPageContent from "./ConfirmedPageContent";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmedPageContent />
    </Suspense>
  );
}
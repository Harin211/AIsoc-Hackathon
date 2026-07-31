import { SyncSpaceApp } from "@/components/SyncSpaceApp";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function Home() {
  const store = getStore();
  return <SyncSpaceApp initial={store} />;
}

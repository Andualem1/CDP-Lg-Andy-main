import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { clearCurrentSession } from "@/lib/auth/server";

export async function GET() {
  const headerStore = await headers();
  const isPrefetch =
    headerStore.get("next-router-prefetch") === "1" ||
    headerStore.get("purpose") === "prefetch" ||
    headerStore.get("sec-purpose")?.includes("prefetch");

  if (isPrefetch) {
    return new Response(null, { status: 204 });
  }

  await clearCurrentSession();
  redirect("/sign-in");
}

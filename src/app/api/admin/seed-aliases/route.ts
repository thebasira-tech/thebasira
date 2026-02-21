import { seedAliases } from "@/server/seed/seedAliases";

export async function POST() {
  await seedAliases();
  return Response.json({ ok: true });
}

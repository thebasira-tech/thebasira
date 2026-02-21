import { seedSecurities } from "@/server/seed/seedSecurities";

export async function POST() {
  await seedSecurities();
  return Response.json({ ok: true });
}

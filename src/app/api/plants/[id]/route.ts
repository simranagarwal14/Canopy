import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { describeServerError } from "@/lib/gardenService";

export const dynamic = "force-dynamic";

/** DELETE /api/plants/:id — remove one of the signed-in user's plants (its CareLogs cascade). */
export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Plant id is required." }, { status: 400 });

  try {
    // Scoped to the caller's garden, so one user can never delete another's plant.
    const plant = await prisma.plant.findFirst({
      where: { id, garden: { user: { email: auth.email } } },
      select: { id: true, name: true },
    });
    if (!plant) return NextResponse.json({ error: "Plant not found." }, { status: 404 });

    await prisma.plant.delete({ where: { id: plant.id } }); // CareLog rows: onDelete Cascade
    return NextResponse.json({ ok: true, id: plant.id, name: plant.name });
  } catch (err) {
    console.error("[api/plants/:id DELETE]", err);
    return NextResponse.json({ error: describeServerError(err) }, { status: 500 });
  }
}

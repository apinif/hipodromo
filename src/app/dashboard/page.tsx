import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = session.user.id;

  const members = await prisma.member.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  const lastHistory = await prisma.drawHistory.findFirst({
    where: { userId },
    orderBy: { drawnAt: "desc" },
  });

  return (
    <DashboardClient
      initialMembers={members.map((m) => ({
        id: m.id,
        name: m.name,
        drawn: m.drawn,
        createdAt: m.createdAt.toISOString(),
      }))}
      lastWinner={lastHistory?.memberName ?? null}
      user={{
        name: session.user?.name ?? null,
        email: session.user?.email ?? null,
        image: session.user?.image ?? null,
      }}
    />
  );
}

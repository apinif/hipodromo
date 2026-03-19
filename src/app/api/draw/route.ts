import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const members = await prisma.member.findMany({ where: { userId } });

  const total = members.length;
  const pool = members.filter((m) => !m.drawn);
  const drawn = members.filter((m) => m.drawn);

  const lastHistory = await prisma.drawHistory.findFirst({
    where: { userId },
    orderBy: { drawnAt: "desc" },
  });

  return NextResponse.json({
    poolSize: pool.length,
    totalMembers: total,
    drawnThisCycle: drawn.length,
    lastWinner: lastHistory?.memberName ?? null,
  });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const result = await prisma.$transaction(async (tx) => {
    let pool = await tx.member.findMany({
      where: { userId, drawn: false },
    });

    let poolReset = false;

    if (pool.length === 0) {
      const allMembers = await tx.member.findMany({ where: { userId } });
      if (allMembers.length === 0) return null;

      await tx.member.updateMany({
        where: { userId },
        data: { drawn: false },
      });

      pool = await tx.member.findMany({ where: { userId, drawn: false } });
      poolReset = true;
    }

    const winnerIndex = Math.floor(Math.random() * pool.length);
    const winner = pool[winnerIndex];

    await tx.member.update({
      where: { id: winner.id },
      data: { drawn: true },
    });

    await tx.drawHistory.create({
      data: { memberId: winner.id, memberName: winner.name, userId },
    });

    const remaining = pool.filter((m) => m.id !== winner.id);

    return {
      winner: { ...winner, createdAt: winner.createdAt.toISOString() },
      poolReset,
      remainingCount: remaining.length,
      totalCount: pool.length,
    };
  });

  if (!result) {
    return NextResponse.json({ error: "No members in team" }, { status: 400 });
  }

  return NextResponse.json(result);
}

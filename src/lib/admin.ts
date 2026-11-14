import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const userId = (session.user as { id?: string }).id;
  const userEmail = session.user.email;
  if (!userId && !userEmail) return null;

  const whereConditions: Array<{ id?: string; email?: string }> = [];
  if (userId) whereConditions.push({ id: userId });
  if (userEmail) whereConditions.push({ email: userEmail });

  const dbUser = await prisma.user.findFirst({
    where: {
      OR: whereConditions,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!dbUser || dbUser.role !== "admin") {
    return null;
  }

  return { session, user: dbUser };
}

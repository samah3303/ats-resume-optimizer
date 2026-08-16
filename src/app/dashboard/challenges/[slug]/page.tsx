import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { CHALLENGES } from "@/lib/challenges/data";
import { CodingWorkspace } from "@/components/code/CodingWorkspace";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const challenge = CHALLENGES.find((c) => c.slug === slug || c.id === slug);
  if (!challenge) return { title: "Challenge Not Found" };

  return {
    title: `${challenge.title} | Coding Sandbox | OmniJob AI`,
    description: `Solve ${challenge.title} (${challenge.difficulty}) in-browser with automated test assertions and AI Big-O complexity analysis.`,
  };
}

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const { slug } = await params;
  const challenge = CHALLENGES.find((c) => c.slug === slug || c.id === slug);

  if (!challenge) {
    notFound();
  }

  return <CodingWorkspace challenge={challenge} />;
}

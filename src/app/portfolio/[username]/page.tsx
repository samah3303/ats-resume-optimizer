import { VerifiedPortfolioCard } from "@/components/portfolio/VerifiedPortfolioCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return {
    title: `@${username} | Verified Candidate Portfolio | Paniund`,
    description: `View @${username}'s verified ATS resume score, coding challenge badges, and system design architecture certifications on Paniund.`,
  };
}

export default async function VerifiedPortfolioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <VerifiedPortfolioCard
      username={username}
      fullName={username.charAt(0).toUpperCase() + username.slice(1)}
    />
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TotalCompCalculator } from "@/components/offers/TotalCompCalculator";
import { NegotiationWarRoomChat } from "@/components/offers/NegotiationWarRoomChat";
import { CounterOfferLetterModal } from "@/components/offers/CounterOfferLetterModal";
import { OfferComparisonMatrix } from "@/components/offers/OfferComparisonMatrix";

export const metadata = {
  title: "Salary Negotiation War Room & Offer Comparator | OmniJob AI",
  description: "Total compensation breakdown with 4-year equity vesting schedules, interactive AI recruiter negotiation bot, and multi-offer comparison matrix.",
};

export default async function OffersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-28">
      {/* Breadcrumb & Hero Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-black">Compensation & Negotiation War Room</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black tracking-tight flex items-center gap-3">
              <span>Salary Negotiation & Offer War Room</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-3xl mt-1.5 leading-relaxed">
              Model 4-year total compensation packages with vesting schedules, simulate live counter-negotiations against an AI recruiter bot, and compare competing offers side-by-side.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Real-Time AI Coach Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Suite Modules */}
      <div className="space-y-10">
        {/* Module 1: Total Comp Calculator */}
        <section className="space-y-4">
          <TotalCompCalculator />
        </section>

        {/* Module 2: Live AI Recruiter Negotiation War Room */}
        <section className="space-y-4">
          <NegotiationWarRoomChat />
        </section>

        {/* Module 3: Formal Counter Letter Generator */}
        <section className="space-y-4">
          <CounterOfferLetterModal />
        </section>

        {/* Module 4: Multi-Offer Comparison Matrix */}
        <section className="space-y-4">
          <OfferComparisonMatrix />
        </section>
      </div>
    </div>
  );
}

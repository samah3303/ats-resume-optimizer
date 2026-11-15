"use client";

import Link from "next/link";
import { UserProfile } from "@/types";

interface ProfileSummaryTileProps {
  profile: UserProfile | null;
}

export default function ProfileSummaryTile({ profile }: ProfileSummaryTileProps) {
  const skillsCount = profile?.skills?.length || 0;
  const targetRoles = profile?.targetRoles || [];

  return (
    <div className="nordic-card p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-nordic-border mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-nordic-primary rounded-[2px]" />
            <h3 className="text-sm font-bold text-nordic-text uppercase tracking-wide">
              Your Profile
            </h3>
          </div>
          <span className="text-xs font-mono text-nordic-success font-semibold">ACTIVE</span>
        </div>

        <div className="p-4 bg-nordic-bg rounded-[4px] border border-nordic-border my-4">
          <div className="text-lg font-bold text-nordic-text truncate">
            {profile?.name || "Candidate"}
          </div>
          <div className="text-xs text-nordic-neutral truncate mt-0.5 font-mono">
            {profile?.email}
          </div>
          {profile?.location && (
            <div className="text-xs text-nordic-text-secondary mt-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-nordic-neutral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{profile.location}</span>
            </div>
          )}
        </div>

        <div className="space-y-3 text-xs my-4">
          <div>
            <span className="text-nordic-neutral block text-[11px] font-semibold uppercase tracking-wider mb-1">
              Target Roles
            </span>
            <span className="font-semibold text-sm text-nordic-text block truncate">
              {targetRoles.length > 0 ? targetRoles.join(", ") : "Not specified"}
            </span>
          </div>

          <div>
            <span className="text-nordic-neutral block text-[11px] font-semibold uppercase tracking-wider mb-1.5">
              Top Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {skillsCount > 0 ? (
                profile?.skills?.slice(0, 5).map((skill) => (
                  <span
                    key={skill}
                    className="nordic-chip text-[11px] h-6 px-2.5 bg-white border border-nordic-border text-nordic-text"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-nordic-neutral">No skills added yet</span>
              )}
              {skillsCount > 5 && (
                <span className="h-6 px-2 rounded-[4px] bg-nordic-primary text-white text-[10px] font-bold flex items-center">
                  +{skillsCount - 5} MORE
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-nordic-border mt-2">
        <Link
          href="/dashboard/profile"
          className="nordic-btn-yellow w-full text-xs h-10 font-bold uppercase tracking-wide text-center flex items-center justify-center"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
}

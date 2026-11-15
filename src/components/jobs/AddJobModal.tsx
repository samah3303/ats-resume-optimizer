"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { JobListing } from "@/types";

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: (job: JobListing) => void;
  onShowToast: (text: string, type: "success" | "error" | "info") => void;
}

export function AddJobModal({
  isOpen,
  onClose,
  onJobCreated,
  onShowToast,
}: AddJobModalProps) {
  const [parsingUrl, setParsingUrl] = useState(false);
  const [parseError, setParseError] = useState("");
  const [savingJob, setSavingJob] = useState(false);

  // Form Fields
  const [urlInput, setUrlInput] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");

  const resetForm = () => {
    setUrlInput("");
    setTitle("");
    setCompany("");
    setLocation("");
    setSalary("");
    setJobType("Full-time");
    setDescription("");
    setRequirements("");
    setParseError("");
  };

  const handleParseUrl = async () => {
    if (!urlInput.trim()) return;
    setParsingUrl(true);
    setParseError("");

    try {
      const res = await fetch("/api/jobs/parse-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to extract job posting data");
      }

      const data = await res.json();
      if (data.title) setTitle(data.title);
      if (data.company) setCompany(data.company);
      if (data.location) setLocation(data.location);
      if (data.salary) setSalary(data.salary);
      if (data.jobType) setJobType(data.jobType);
      if (data.description) setDescription(data.description);
      if (data.requirements) {
        setRequirements(
          Array.isArray(data.requirements)
            ? data.requirements.join("\n")
            : data.requirements
        );
      }
      onShowToast("Job details auto-filled from URL!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse URL";
      setParseError(msg);
      onShowToast(msg, "error");
    } finally {
      setParsingUrl(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) {
      onShowToast("Title and Company are required.", "error");
      return;
    }

    setSavingJob(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          company,
          location,
          salary,
          jobType,
          description,
          requirements,
          sourceUrl: urlInput || null,
          source: urlInput ? "url_import" : "manual",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save job");
      }

      const newJob = await res.json();
      onJobCreated(newJob);
      resetForm();
      onClose();
      onShowToast("Job successfully added to your tracker!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save job";
      onShowToast(msg, "error");
    } finally {
      setSavingJob(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add a Job"
      subtitle="Extract details automatically from a job link or fill out manually"
      maxWidth="2xl"
    >
      <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
        {/* URL Fast Import */}
        <div className="border border-nordic-border p-4 bg-nordic-bg rounded-[4px]">
          <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-2">
            Paste Job Link (LinkedIn, Indeed, or company site)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://boards.greenhouse.io/company/jobs/..."
              aria-label="Job posting URL"
              className="flex-1 h-10 px-3 bg-white border border-nordic-border rounded-[4px] text-xs text-nordic-text focus:outline-none focus:border-nordic-primary"
            />
            <button
              type="button"
              onClick={handleParseUrl}
              disabled={parsingUrl || !urlInput.trim()}
              className="nordic-btn-yellow h-10 px-4 text-xs font-bold disabled:opacity-50 cursor-pointer"
            >
              {parsingUrl ? "Fetching..." : "Auto-Fill"}
            </button>
          </div>
          {parseError && (
            <p className="mt-2 text-xs font-medium text-nordic-error" role="alert">
              {parseError}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Staff Software Engineer"
                className="w-full h-10 px-3 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text focus:outline-none focus:border-nordic-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
                Company *
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Spotify"
                className="w-full h-10 px-3 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text focus:outline-none focus:border-nordic-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote / Hybrid"
                className="w-full h-10 px-3 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text focus:outline-none focus:border-nordic-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
                Salary (optional)
              </label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. $180,000 - $220,000"
                className="w-full h-10 px-3 bg-white border border-nordic-border rounded-[4px] text-sm font-mono text-nordic-text focus:outline-none focus:border-nordic-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
                Job Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text focus:outline-none focus:border-nordic-primary"
              >
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
              Job Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste the core responsibilities..."
              className="w-full p-3 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text focus:outline-none focus:border-nordic-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
              Key Requirements (one per line)
            </label>
            <textarea
              rows={3}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="5+ years Go or TypeScript&#10;Cloud infrastructure in AWS&#10;Kubernetes in production"
              className="w-full p-3 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text focus:outline-none focus:border-nordic-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-nordic-border">
            <button
              type="button"
              onClick={onClose}
              className="nordic-btn-outline h-10 px-4 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingJob}
              aria-busy={savingJob}
              className="nordic-btn-primary h-10 px-6 text-xs font-bold uppercase tracking-wide disabled:opacity-50 cursor-pointer"
            >
              {savingJob ? "Saving..." : "Save Job"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

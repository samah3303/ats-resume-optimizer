/**
 * paniund 1-Click Job Clipper — Content Script (v1.0.1)
 * Extracts structured job data from Indeed (including 2-pane & iframes), Naukri Gulf / Naukri,
 * LinkedIn, Glassdoor, Greenhouse, Lever, Workday, and generic career pages.
 */

(function () {
  // Generic helper to query selectors within a root container
  function getTextFromRoot(root, selectors) {
    if (!root) return "";
    for (const s of selectors) {
      try {
        const el = root.querySelector(s);
        if (el && el.innerText && el.innerText.trim()) {
          return el.innerText.trim();
        }
      } catch {}
    }
    return "";
  }

  // Helper to search across accessible iframes (crucial for Indeed 2-pane viewjobs)
  function findAccessibleIframes() {
    const list = [];
    try {
      const iframes = document.querySelectorAll("iframe");
      for (const ifr of iframes) {
        try {
          const doc = ifr.contentDocument || ifr.contentWindow?.document;
          if (doc && doc.body) {
            list.push(doc);
          }
        } catch {
          // Cross-origin iframe, ignore
        }
      }
    } catch {}
    return list;
  }

  function extractJobFromPage() {
    const url = window.location.href;
    const host = window.location.hostname.toLowerCase();

    let title = "";
    let company = "";
    let location = "";
    let salary = null;
    let description = "";
    let source = "web";
    let canonicalUrl = url;

    const accessibleDocs = findAccessibleIframes();

    // =========================================================================
    // 1. INDEED (Standalone /viewjob, Search Results 2-Pane, Regional Domains)
    // =========================================================================
    if (host.includes("indeed.")) {
      source = "indeed";

      // Detect Canonical Job URL if on search page with &vjk=...
      let vjk = null;
      try {
        const urlObj = new URL(url);
        vjk = urlObj.searchParams.get("vjk") || urlObj.searchParams.get("jk");
        if (vjk) {
          canonicalUrl = `https://${window.location.host}/viewjob?jk=${vjk}`;
        }
      } catch {}

      // Find the active selected card in the left search results (if in 2-pane view)
      let activeCard = null;
      if (vjk) {
        activeCard = document.querySelector(
          `[data-jk="${vjk}"], a[data-jk="${vjk}"], a[href*="${vjk}"]`
        )?.closest(".cardOutline, .tapItem, [data-testid='slider_item'], .job_seen_beacon, [class*='jobCard']");
      }
      if (!activeCard) {
        activeCard = document.querySelector(
          ".jobCard_selected, .tapItem.selected, [data-testid='slider_item_selected'], .vjs-highlight, [class*='selected'][data-jk]"
        );
      }

      // Check if an iframe houses the right-pane job view
      let rightPaneDoc = null;
      for (const idoc of accessibleDocs) {
        if (
          idoc.querySelector("#jobDescriptionText") ||
          idoc.querySelector("[data-testid='jobsearch-JobInfoHeader-title']") ||
          idoc.querySelector(".jobsearch-JobInfoHeader-title") ||
          idoc.querySelector(".jobsearch-JobComponent")
        ) {
          rightPaneDoc = idoc;
          break;
        }
      }

      // Look for right pane container in the main document
      const rightPaneEl = document.querySelector([
        "#jobsearch-ViewjobPaneWrapper",
        "[data-testid='jobsearch-ViewjobPaneWrapper']",
        "#vjs-container",
        ".jobsearch-RightPane",
        "[data-testid='viewJobSSRRoot']",
        "#viewJobSSRRoot",
        ".jobsearch-JobComponent",
        "#vjs-content",
        ".vjs-content",
        "div[class*='jobsearch-ViewjobPane']",
        "div[class*='RightPane']",
        "div[class*='fast-apply']"
      ].join(", "));

      // Primary container for details
      const targetRoot = rightPaneDoc || rightPaneEl || document;

      // --- Title ---
      title = getTextFromRoot(targetRoot, [
        "h1[data-testid='jobsearch-JobInfoHeader-title']",
        "h2[data-testid='jobsearch-JobInfoHeader-title']",
        "[data-testid='jobsearch-JobInfoHeader-title']",
        "h1.jobsearch-JobInfoHeader-title",
        "h2.jobsearch-JobInfoHeader-title",
        ".jobsearch-JobInfoHeader-title",
        "[data-testid='simpler-jobTitle']",
        ".jobsearch-JobInfoHeader h1",
        ".jobsearch-JobInfoHeader h2",
        "h2.jobTitle",
        "h1.jobTitle"
      ]);

      // Fallback: If not found in right pane, inspect active selected card
      if (!title && activeCard) {
        title = getTextFromRoot(activeCard, [
          "h2.jobTitle span[id^='jobTitle']",
          "h2.jobTitle a span",
          "h2.jobTitle",
          "[data-testid='jobTitle']",
          "a[id^='job_']"
        ]);
      }

      // --- Company ---
      company = getTextFromRoot(targetRoot, [
        "[data-testid='inlineHeader-companyName'] a",
        "[data-testid='inlineHeader-companyName']",
        "[data-testid='jobsearch-CompanyInfoContainer'] a",
        "[data-testid='jobsearch-CompanyInfoContainer']",
        ".jobsearch-InlineCompanyRating-companyHeader a",
        ".jobsearch-InlineCompanyRating-companyHeader",
        "[data-company-name='true']",
        ".jobsearch-CompanyInfoWithoutReviewsArea a",
        ".jobsearch-CompanyInfoWithoutReviewsArea",
        ".jobsearch-JobInfoHeader-companyName",
        "div.company_location [data-testid='company-name']"
      ]);

      // Fallback: If not found or matched wrong card, inspect active selected card
      if ((!company || company === "Employer") && activeCard) {
        const cardCompany = getTextFromRoot(activeCard, [
          "[data-testid='company-name']",
          ".companyName",
          "span[class*='companyName']",
          "div.company_location [data-testid='company-name']"
        ]);
        if (cardCompany) company = cardCompany;
      }

      // --- Location ---
      location = getTextFromRoot(targetRoot, [
        "[data-testid='inlineHeader-companyLocation']",
        "[data-testid='jobsearch-CompanyInfoContainer'] [data-testid='inlineHeader-companyLocation']",
        "#jobLocationText",
        ".jobsearch-JobInfoHeader-companyLocation",
        "[data-testid='inlineHeader-companyLocation'] span",
        ".jobsearch-CompanyInfoWithoutReviewsArea span"
      ]);

      if (!location && activeCard) {
        location = getTextFromRoot(activeCard, [
          "[data-testid='text-location']",
          ".companyLocation",
          "div[class*='companyLocation']"
        ]);
      }

      // --- Salary ---
      salary = getTextFromRoot(targetRoot, [
        "#salaryInfoAndJobType",
        "[data-testid='attribute_snippets_test_id']",
        "#jobDetailsSection",
        "[data-testid='jobsearch-OtherJobDetailsContainer']",
        ".metadata.salary-snippet-container",
        "#estimatedSalary",
        "[data-testid*='salary']"
      ]) || null;

      if (!salary && activeCard) {
        salary = getTextFromRoot(activeCard, [
          "[data-testid='attribute_snippets_test_id']",
          ".metadata.salary-snippet-container",
          ".salary-snippet-container",
          "div[class*='salary']"
        ]) || null;
      }

      // Regex fallback for currency snippet (e.g. "AED2,200 - AED15,000 a month")
      if (!salary) {
        const textToScan = targetRoot.innerText || (activeCard ? activeCard.innerText : "");
        const salaryMatch = textToScan.match(
          /(?:AED|\$|£|€|₹|CA\$|AU\$|SGD)\s?[\d,]+(?:\s?-\s?(?:AED|\$|£|€|₹|CA\$|AU\$|SGD)?\s?[\d,]+)?(?:\s?(?:a|per|\/)\s?(?:month|year|yr|mo|hour|hr|day|week))?/i
        );
        if (salaryMatch) {
          salary = salaryMatch[0].trim();
        }
      }

      // --- Description ---
      const candidateRoots = [targetRoot];
      if (rightPaneDoc && rightPaneDoc !== targetRoot) candidateRoots.unshift(rightPaneDoc);
      if (rightPaneEl && rightPaneEl !== targetRoot) candidateRoots.push(rightPaneEl);
      if (!candidateRoots.includes(document)) candidateRoots.push(document);

      for (const rootNode of candidateRoots) {
        if (!description) {
          description = getTextFromRoot(rootNode, [
            "#jobDescriptionText",
            "[data-testid='jobDescriptionText']",
            ".jobsearch-jobDescriptionText",
            "#jobDescription",
            "div[id*='jobDescriptionText']",
            "div[class*='jobsearch-JobComponent-description']",
            ".jobsearch-JobComponent-description",
            "#vjs-desc"
          ]);
        }
      }

      // Fallback: heading search for "Full job description"
      if (!description) {
        for (const rootNode of candidateRoots) {
          const headings = Array.from(rootNode.querySelectorAll("h1, h2, h3, h4, div, b, strong"));
          const matchHeading = headings.find((el) => {
            const t = el.innerText?.trim().toLowerCase();
            return t === "full job description" || t === "job description" || t === "job details";
          });
          if (matchHeading && matchHeading.parentElement) {
            const fullText = matchHeading.parentElement.innerText;
            if (fullText && fullText.length > 120) {
              description = fullText.replace(/^.*?(?:full job description|job description)/i, "").trim();
              if (description.length > 50) break;
            }
          }
        }
      }

      // Fallback: strip header from rightPaneEl
      if (!description && rightPaneEl) {
        const paneText = rightPaneEl.innerText || "";
        const stripped = paneText.replace(/^(?:Apply now|Save job|Report job).*?\n/gim, "").trim();
        if (stripped.length > 100) {
          description = stripped;
        }
      }
    }

    // =========================================================================
    // 2. NAUKRI GULF & NAUKRI.COM
    // =========================================================================
    else if (host.includes("naukrigulf.com") || host.includes("naukri.com")) {
      source = host.includes("naukrigulf") ? "naukrigulf" : "naukri";

      title = getTextFromRoot(document, [
        "h1.info-position",
        ".info-position",
        "h1.job-title",
        "h1.styles_jd-header-title__v5qvu",
        "h1[itemprop='title']",
        "h1.jd-header-title",
        "h1"
      ]);

      company = getTextFromRoot(document, [
        "a.info-org",
        ".info-org",
        "a.company-name",
        ".company-name",
        "[itemprop='hiringOrganization']",
        ".styles_jd-header-comp-name__v5qvu a",
        ".styles_jd-header-comp-name__v5qvu",
        "a[href*='/jobs-at-']",
        ".org"
      ]);

      location = getTextFromRoot(document, [
        "span.info-loc",
        ".info-loc",
        "span.location",
        ".location",
        "[itemprop='jobLocation']",
        "p.loc-exp span",
        ".styles_jhc__location__ a",
        ".styles_jhc__location__",
        ".loc"
      ]);

      salary = getTextFromRoot(document, [
        "span.info-sal",
        ".info-sal",
        "span.salary",
        ".salary",
        "p.loc-exp span.sal",
        ".styles_jhc__salary__"
      ]) || null;

      description = getTextFromRoot(document, [
        "section.job-desc",
        "[itemprop='description']",
        ".job-details-content",
        ".description-content",
        ".details-section",
        ".jd-desc",
        ".content-wrapper",
        "div.job-details-content",
        "div.ng-job-desc",
        "div.details-info",
        "div[class*='job-desc']",
        "div[class*='jobDescription']",
        "div[class*='description']",
        "div.details-container",
        ".dang-inner-html",
        ".styles_JDJobs-desc__",
        ".job-desc",
        ".desc"
      ]);

      // Fallback heading search for Naukri
      if (!description) {
        const headings = Array.from(document.querySelectorAll("h2, h3, h4, div, strong"));
        const targetHeading = headings.find((el) => {
          const t = el.innerText?.trim().toLowerCase();
          return t === "job description" || t === "role description" || t === "key skills";
        });
        if (targetHeading && targetHeading.parentElement) {
          const block = targetHeading.parentElement.innerText;
          if (block && block.length > 80) {
            description = block;
          }
        }
      }
    }

    // =========================================================================
    // 3. BAYT.COM (Middle East / Gulf Leading Job Platform)
    // =========================================================================
    else if (host.includes("bayt.com")) {
      source = "bayt";

      // Detect active details pane in 2-pane search view
      const rightPane = document.querySelector([
        "[data-js-view-job-details]",
        "[data-js-job-details]",
        "#view-job-details",
        ".view-job-details",
        "[data-viewjob-container]",
        ".card-job-details",
        ".is-active[data-js-job-details]"
      ].join(", "));

      // Check active selected card in search results feed
      const activeCard = document.querySelector([
        "li.is-selected",
        "li[class*='selected']",
        "li[data-js-job].is-active",
        ".card.is-active",
        "[data-js-job].is-selected"
      ].join(", "));

      const root = rightPane || document;

      // Title
      title = getTextFromRoot(root, [
        "h1[data-js-job-title]",
        "h2[data-js-job-title]",
        "[data-js-job-title]",
        "h1#job_title",
        "h1.t-h1",
        "h2.t-h2",
        "h1.u-stretch",
        ".t-h2.u-stretch",
        "h1",
        "h2"
      ]);

      if (!title && activeCard) {
        title = getTextFromRoot(activeCard, [
          "h2[data-js-job-title]",
          "[data-js-job-title]",
          "h2 a",
          "h2"
        ]);
      }

      // Company
      company = getTextFromRoot(root, [
        "a[data-js-company-name]",
        "[data-js-company-name]",
        "a[href*='/companies/']",
        ".t-mute a",
        "span[data-js-company-name]",
        "p.t-mute"
      ]);

      if (!company && activeCard) {
        company = getTextFromRoot(activeCard, [
          "a[data-js-company-name]",
          "[data-js-company-name]",
          ".t-mute a",
          "a[href*='/companies/']"
        ]);
      }

      // Location
      location = getTextFromRoot(root, [
        "[data-js-job-location]",
        "[data-js-location]",
        "span[data-js-job-location]",
        ".u-icon-pin + span",
        "li[data-js-location]"
      ]);

      // Regex fallback for Bayt location (e.g. "Dubai, UAE")
      if (!location) {
        const textToScan = root.innerText || "";
        const locMatch = textToScan.match(/(?:Dubai|Abu Dhabi|Sharjah|Ajman|Ras al-Khaimah|Fujairah|Riyadh|Jeddah|Dammam|Doha|Kuwait|Manama|Muscat|Cairo|Amman)[,\s]+(?:UAE|United Arab Emirates|Saudi Arabia|KSA|Qatar|Kuwait|Bahrain|Oman|Egypt|Jordan)/i);
        if (locMatch) {
          location = locMatch[0].trim();
        }
      }

      // Salary (e.g. "AED 3,673 - AED 5,509")
      salary = getTextFromRoot(root, [
        "[data-js-job-salary]",
        "[data-js-salary]",
        ".u-icon-money + span",
        "li[data-js-salary]"
      ]) || null;

      if (!salary) {
        const textToScan = root.innerText || (activeCard ? activeCard.innerText : "");
        const salaryMatch = textToScan.match(
          /(?:AED|SAR|QAR|KWD|BHD|OMR|\$|£|€)\s?[\d,]+(?:\s?-\s?(?:AED|SAR|QAR|KWD|BHD|OMR|\$|£|€)?\s?[\d,]+)?(?:\s?(?:a|per|\/)\s?(?:month|year|yr|mo|hour|hr|day|week))?/i
        );
        if (salaryMatch) {
          salary = salaryMatch[0].trim();
        }
      }

      // Description
      description = getTextFromRoot(root, [
        "[data-js-job-description]",
        "#job_desc",
        "#job-description",
        ".job-description",
        "[data-js-description]",
        ".u-text-pre-line",
        ".t-break"
      ]);

      if (!description) {
        const headings = Array.from(root.querySelectorAll("h2, h3, h4, div, strong, b"));
        const targetHeading = headings.find((el) => {
          const t = el.innerText?.trim().toLowerCase();
          return t === "job description" || t === "role overview";
        });
        if (targetHeading && targetHeading.parentElement) {
          const block = targetHeading.parentElement.innerText;
          if (block && block.length > 80) {
            description = block.replace(/^.*?(?:job description)/i, "").trim();
          }
        }
      }

      if (!description && rightPane) {
        const paneText = rightPane.innerText || "";
        const stripped = paneText.replace(/^(?:Easy Apply|Apply on company site|Save).*?\n/gim, "").trim();
        if (stripped.length > 100) {
          description = stripped;
        }
      }
    }

    // =========================================================================
    // 3. LINKEDIN (Standalone /view & 2-Pane /search)
    // =========================================================================
    else if (host.includes("linkedin.com")) {
      source = "linkedin";

      try {
        const urlObj = new URL(url);
        const currentJobId = urlObj.searchParams.get("currentJobId");
        if (currentJobId) {
          canonicalUrl = `https://www.linkedin.com/jobs/view/${currentJobId}/`;
        }
      } catch {}

      const linkedinPane = document.querySelector([
        ".jobs-search__job-details--container",
        ".job-view-layout",
        ".jobs-details__main-content",
        ".job-details-jobs-unified-top-card",
        ".job-details-module"
      ].join(", "));

      const root = linkedinPane || document;

      title = getTextFromRoot(root, [
        ".job-details-jobs-unified-top-card__job-title",
        "h1.t-24",
        ".jobs-unified-top-card__job-title",
        "h1.job-title",
        ".top-card-layout__title",
        "h1"
      ]);

      company = getTextFromRoot(root, [
        ".job-details-jobs-unified-top-card__company-name a",
        ".job-details-jobs-unified-top-card__company-name",
        ".jobs-unified-top-card__company-name",
        "a.topcard__org-name-link",
        ".topcard__flavor--black-link"
      ]);

      location = getTextFromRoot(root, [
        ".job-details-jobs-unified-top-card__bullet",
        ".jobs-unified-top-card__bullet",
        "span.topcard__flavor--bullet",
        ".top-card-layout__first-sub-slice span:last-child"
      ]);

      const insightText = getTextFromRoot(root, [
        ".job-details-jobs-unified-top-card__job-insight",
        ".jobs-unified-top-card__job-insight"
      ]);
      if (insightText && /[\$£€AED\d]/i.test(insightText) && /yr|mo|hr|year|month|hour/i.test(insightText)) {
        salary = insightText.split("·")[0]?.trim() || null;
      }

      description = getTextFromRoot(root, [
        "#job-details",
        ".jobs-description__content",
        "article.jobs-description__container",
        ".show-more-less-html__markup",
        ".jobs-box__html-content",
        "div.jobs-description-content__text",
        "[data-job-description]"
      ]);
    }

    // =========================================================================
    // 4. GLASSDOOR
    // =========================================================================
    else if (host.includes("glassdoor.com")) {
      source = "glassdoor";
      title = getTextFromRoot(document, [
        "[data-test='job-title']",
        "h1.heading_Heading__",
        "h1"
      ]);

      company = getTextFromRoot(document, [
        "[data-test='employer-name']",
        "h4.heading_Heading__",
        ".EmployerProfile_employerName__"
      ]);

      location = getTextFromRoot(document, [
        "[data-test='location']",
        ".JobDetails_location__"
      ]);

      salary = getTextFromRoot(document, [
        "[data-test='detailSalary']",
        ".SalaryEstimate_salaryRange__"
      ]) || null;

      description = getTextFromRoot(document, [
        "[data-test='jobDescriptionContent']",
        ".JobDetails_jobDescription__",
        "#JobDescriptionContainer"
      ]);
    }

    // =========================================================================
    // 5. GREENHOUSE
    // =========================================================================
    else if (host.includes("greenhouse.io")) {
      source = "greenhouse";
      title = getTextFromRoot(document, [".app-title", "h1.title", "h1"]);
      company = getTextFromRoot(document, [".company-name", ".logo-container img[alt]"]);
      location = getTextFromRoot(document, [".location"]);
      description = getTextFromRoot(document, ["#content", "#main", ".body"]);
    }

    // =========================================================================
    // 6. LEVER
    // =========================================================================
    else if (host.includes("lever.co")) {
      source = "lever";
      title = getTextFromRoot(document, [".posting-headline h2", "h2"]);
      company = getTextFromRoot(document, [".posting-header h1", ".main-header-logo img[alt]"]);
      location = getTextFromRoot(document, [".posting-categories .location", ".location"]);
      description = getTextFromRoot(document, [".section-wrapper.page-full-width", ".content"]);
    }

    // =========================================================================
    // 7. WORKDAY & ASHBY
    // =========================================================================
    else if (host.includes("myworkdayjobs.com") || host.includes("workday")) {
      source = "workday";
      title = getTextFromRoot(document, ["[data-automation-id='jobPostingHeader']", "h2", "h1"]);
      company = getTextFromRoot(document, ["[data-automation-id='companyName']", "meta[property='og:site_name']"]);
      location = getTextFromRoot(document, ["[data-automation-id='jobPostingLocation']"]);
      description = getTextFromRoot(document, ["[data-automation-id='jobPostingDescription']", "main"]);
    } else if (host.includes("ashbyhq.com")) {
      source = "ashby";
      title = getTextFromRoot(document, ["h1", "[data-testid='job-title']"]);
      company = getTextFromRoot(document, ["meta[property='og:site_name']", ".company-name"]);
      location = getTextFromRoot(document, [".location", "[data-testid='job-location']"]);
      description = getTextFromRoot(document, ["[data-testid='job-description']", ".job-description"]);
    }

    // =========================================================================
    // 8. GENERIC FALLBACK
    // =========================================================================
    else {
      source = "web";
      title = getTextFromRoot(document, ["h1", "meta[property='og:title']"]);
      if (!title) {
        title = document.title.split(/[-|–•]/)[0]?.trim() || document.title;
      }

      const metaOrg = document.querySelector("meta[property='og:site_name']");
      company =
        metaOrg?.getAttribute("content") ||
        window.location.hostname.replace("www.", "").split(".")[0];

      description = getTextFromRoot(document, [
        "[data-testid*='job-description']",
        "[class*='JobDescription']",
        "[class*='job-description']",
        "[id*='job-description']",
        "[id*='jobDescription']",
        "[itemprop='description']",
        "article",
        "main",
        "[role='main']",
        ".job-description",
        "#job-description",
        ".description"
      ]);
    }

    // Final cleanups
    title = title.replace(/\s+/g, " ").trim();
    company = company.replace(/\s+/g, " ").trim();
    location = location.replace(/\s+/g, " ").trim();
    salary = salary ? salary.replace(/\s+/g, " ").trim() : null;
    description = description.replace(/\s+/g, " ").trim();

    // Preserve substantial description length for ATS analysis (up to 12,000 chars)
    if (description.length > 12000) {
      description = description.slice(0, 12000);
    }

    return {
      title: title || "Job Opening",
      company: company || "Employer",
      location: location || "Remote",
      salary,
      description: description || `Listing from: ${canonicalUrl}`,
      descriptionLength: description ? description.length : 0,
      sourceUrl: canonicalUrl,
      source,
      pageTitle: document.title,
    };
  }

  // Listen for requests from popup.js
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "GET_PAGE_JOB") {
        try {
          const jobData = extractJobFromPage();
          sendResponse({ success: true, data: jobData });
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      }
      return true;
    });
  }
})();

"use server";

import handleError from "../handlers/error";

export interface Job {
  id: number;
  title: string;
  company: string;
  logo: string;
  category: string;
  jobType: string;
  location: string;
  salary: string;
  url: string;
  publishedAt: string;
  description: string;
}

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo: string;
  category: string;
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
}

const JOBS_PAGE_SIZE = 10;

/** Remote developer jobs from the free Remotive API (no key required). */
export async function getJobs({
  query = "",
  page = 1,
}: {
  query?: string;
  page?: number;
}): Promise<ActionResponse<{ items: Job[]; isNext: boolean }>> {
  try {
    const url = new URL("https://remotive.com/api/remote-jobs");
    url.searchParams.set("category", "software-dev");
    if (query) url.searchParams.set("search", query);

    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error(`Jobs service responded with ${response.status}`);

    const { jobs } = (await response.json()) as { jobs: RemotiveJob[] };

    const start = (page - 1) * JOBS_PAGE_SIZE;
    const items = jobs.slice(start, start + JOBS_PAGE_SIZE).map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company_name,
      logo: job.company_logo,
      category: job.category,
      jobType: job.job_type.replace("_", " "),
      location: job.candidate_required_location,
      salary: job.salary,
      url: job.url,
      publishedAt: job.publication_date,
      description: job.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 220),
    }));

    return { success: true, data: { items, isNext: jobs.length > start + JOBS_PAGE_SIZE } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

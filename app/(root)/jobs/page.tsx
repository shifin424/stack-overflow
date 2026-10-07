import Image from "next/image";
import Link from "next/link";

import DataRenderer from "@/components/DataRenderer";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/search/LocalSearch";
import { Button } from "@/components/ui/button";
import { getJobs } from "@/lib/actions/job.action";
import { getTimeStamp } from "@/lib/utils";

const Jobs = async ({ searchParams }: RouteParams) => {
  const { page, query } = await searchParams;

  const { success, data, error } = await getJobs({
    query: query || "",
    page: Number(page) || 1,
  });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Jobs</h1>

      <div className="mt-11">
        <LocalSearch imgSrc="/icons/search.svg" placeholder="Search remote developer jobs..." otherClasses="flex-1" />
      </div>

      <DataRenderer
        success={success}
        error={error}
        data={data?.items}
        empty={{ title: "No jobs found", message: "Try a different keyword." }}
        render={(jobs) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {jobs.map((job) => (
              <article key={job.id} className="card-wrapper flex flex-col gap-5 rounded-[10px] p-8 sm:flex-row">
                {job.logo ? (
                  <Image src={job.logo} alt={job.company} width={64} height={64} unoptimized className="size-16 rounded-lg object-contain" />
                ) : (
                  <div className="primary-gradient flex-center size-16 shrink-0 rounded-lg text-xl font-bold text-white">
                    {job.company.charAt(0)}
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex-between flex-wrap gap-2">
                    <h3 className="base-semibold text-dark200_light900">{job.title}</h3>
                    <p className="small-regular text-dark400_light700">{getTimeStamp(job.publishedAt)}</p>
                  </div>
                  <p className="body-medium text-dark500_light700 mt-1">{job.company}</p>
                  <p className="body-regular text-dark400_light700 mt-3 line-clamp-2">{job.description}</p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="small-medium text-light400_light500 flex flex-wrap gap-4 capitalize">
                      <span>{job.location}</span>
                      <span>{job.jobType}</span>
                      {job.salary && <span>{job.salary}</span>}
                    </div>
                    <Button
                      nativeButton={false}
                      render={<Link href={job.url} target="_blank" rel="noopener noreferrer" />}
                      className="primary-gradient !text-light-900"
                    >
                      View job
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      />

      <Pagination page={Number(page) || 1} isNext={data?.isNext ?? false} />
    </>
  );
};

export default Jobs;

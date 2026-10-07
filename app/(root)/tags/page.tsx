import Link from "next/link";

import TagCard from "@/components/cards/TagCard";
import DataRenderer from "@/components/DataRenderer";
import CommonFilter from "@/components/filters/CommonFilter";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/search/LocalSearch";
import ROUTES from "@/constants/routes";
import { getTags } from "@/lib/actions/tag.action";

const tagFilters = [
  { name: "Popular", value: "popular" },
  { name: "Recent", value: "recent" },
  { name: "Oldest", value: "oldest" },
  { name: "Name", value: "name" },
];

const Tags = async ({ searchParams }: RouteParams) => {
  const { page, pageSize, query, filter } = await searchParams;

  const { success, data, error } = await getTags({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 12,
    query: query || "",
    filter: filter || "",
  });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Tags</h1>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch imgSrc="/icons/search.svg" placeholder="Search by tag name..." otherClasses="flex-1" />
        <CommonFilter filters={tagFilters} defaultValue="popular" otherClasses="min-h-[56px] sm:min-w-[170px]" />
      </div>

      <DataRenderer
        success={success}
        error={error}
        data={data?.items}
        empty={{ title: "No tags found", message: "Tags are created when someone asks a question." , button: { text: "Ask a Question", href: ROUTES.ASK_QUESTION }}}
        render={(tags) => (
          <div className="mt-10 flex w-full flex-wrap gap-4">
            {tags.map((tag) => (
              <article key={tag._id} className="background-light900_dark200 light-border flex w-full flex-col rounded-2xl border px-8 py-10 sm:w-[260px]">
                <Link href={ROUTES.TAGS(tag._id)} className="flex items-center justify-between gap-3">
                  <TagCard _id={tag._id} name={tag.name} isButton />
                </Link>
                <p className="small-regular text-dark500_light700 mt-3.5">
                  <span className="body-semibold primary-text-gradient mr-2.5">{tag.questions}+</span>
                  Questions
                </p>
              </article>
            ))}
          </div>
        )}
      />

      <Pagination page={Number(page) || 1} isNext={data?.isNext ?? false} />
    </>
  );
};

export default Tags;

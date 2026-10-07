import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import CommonFilter from "@/components/filters/CommonFilter";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/search/LocalSearch";
import ROUTES from "@/constants/routes";
import { getSavedQuestions } from "@/lib/actions/collection.action";

const collectionFilters = [
  { name: "Most Recent", value: "mostrecent" },
  { name: "Oldest", value: "oldest" },
];

const Collection = async ({ searchParams }: RouteParams) => {
  const { page, pageSize, query, filter } = await searchParams;

  const { success, data, error } = await getSavedQuestions({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query || "",
    filter: filter || "",
  });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch imgSrc="/icons/search.svg" placeholder="Search saved questions..." otherClasses="flex-1" />
        <CommonFilter
          filters={collectionFilters}
          defaultValue="mostrecent"
          otherClasses="min-h-[56px] sm:min-w-[170px]"
         
        />
      </div>

      <DataRenderer
        success={success}
        error={error}
        data={data?.items}
        empty={{
          title: "No saved questions",
          message: query
            ? "No saved question matches your search."
            : "Tap the star on a question to keep it here for later.",
          button: { text: "Browse questions", href: ROUTES.HOME },
        }}
        render={(questions) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        )}
      />

      <Pagination page={Number(page) || 1} isNext={data?.isNext ?? false} />
    </>
  );
};

export default Collection;

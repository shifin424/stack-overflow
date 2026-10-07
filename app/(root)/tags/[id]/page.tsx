import { notFound } from "next/navigation";

import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/search/LocalSearch";
import ROUTES from "@/constants/routes";
import { getTagQuestions } from "@/lib/actions/tag.action";

const TagQuestions = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const { page, pageSize, query } = await searchParams;

  const { success, data, error } = await getTagQuestions({
    tagId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query || "",
  });

  if (!success && error?.message === "Tag not found") return notFound();

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900 capitalize">{data?.tag.name ?? "Tag"}</h1>
      </section>

      <section className="mt-11">
        <LocalSearch imgSrc="/icons/search.svg" placeholder="Search questions in this tag..." otherClasses="flex-1" />
      </section>

      <DataRenderer
        success={success}
        error={error}
        data={data?.questions}
        empty={{
          title: "No questions found",
          message: "Nothing has been asked with this tag yet.",
          button: { text: "Ask a Question", href: ROUTES.ASK_QUESTION },
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

export default TagQuestions;

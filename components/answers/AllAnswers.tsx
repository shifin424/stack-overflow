import { auth } from "@/auth";
import AnswerCard from "@/components/cards/AnswerCard";
import DataRenderer from "@/components/DataRenderer";
import CommonFilter from "@/components/filters/CommonFilter";
import Pagination from "@/components/Pagination";
import { getAnswers } from "@/lib/actions/answer.action";
import { getMyVotes } from "@/lib/actions/vote.action";

export const answerFilters = [
  { name: "Latest", value: "latest" },
  { name: "Oldest", value: "oldest" },
  { name: "Popular", value: "popular" },
];

interface Props {
  questionId: string;
  totalAnswers: number;
  page: number;
  filter?: string;
}

const AllAnswers = async ({ questionId, totalAnswers, page, filter }: Props) => {
  const session = await auth();
  const userId = session?.user?.id;

  const { success, data, error } = await getAnswers({ questionId, page, pageSize: 10, filter });
  const answers = data?.items ?? [];

  const { data: votes = {} } = userId
    ? await getMyVotes({ targetIds: answers.map((a) => a._id), targetType: "answer" })
    : { data: {} };

  return (
    <div className="mt-11">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">
          {totalAnswers} {totalAnswers === 1 ? "Answer" : "Answers"}
        </h3>

        <CommonFilter
          filters={answerFilters}
          defaultValue="latest"
          otherClasses="sm:min-w-32"
          containerClasses="max-xs:w-full"
        />
      </div>

      <DataRenderer
        success={success}
        error={error}
        data={data?.items}
        empty={{ title: "No answers yet", message: "Be the first to answer this question." }}
        render={(items) =>
          items.map((answer) => (
            <AnswerCard
              key={answer._id}
              {...answer}
              showVotes
              isSignedIn={!!userId}
              isOwner={answer.author._id === userId}
              userVote={votes?.[answer._id] ?? null}
              showActionBtns={answer.author._id === userId}
            />
          ))
        }
      />

      <Pagination page={page} isNext={data?.isNext ?? false} />
    </div>
  );
};

export default AllAnswers;

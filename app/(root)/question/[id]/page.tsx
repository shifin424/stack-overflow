import { notFound } from "next/navigation";
import { after } from "next/server";
import Link from "next/link";

import { auth } from "@/auth";
import AllAnswers from "@/components/answers/AllAnswers";
import TagCard from "@/components/cards/TagCard";
import AnswerForm from "@/components/forms/AnswerForm";
import Metric from "@/components/Metric";
import Preview from "@/components/Preview";
import UserAvatar from "@/components/UserAvatar";
import EditDeleteAction from "@/components/user/EditDeleteAction";
import SaveQuestion from "@/components/votes/SaveQuestion";
import Votes from "@/components/votes/Votes";
import ROUTES from "@/constants/routes";
import { hasSavedQuestion } from "@/lib/actions/collection.action";
import { getQuestion, incrementViews } from "@/lib/actions/question.action";
import { getMyVotes } from "@/lib/actions/vote.action";
import { formatNumber, getTimeStamp } from "@/lib/utils";

const QuestionDetails = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const { page, filter } = await searchParams;

  const { success, data: question } = await getQuestion({ questionId: id });
  if (!success || !question) return notFound();

  // Count the view after the response is sent so it never delays rendering.
  after(async () => {
    await incrementViews({ questionId: id });
  });

  const session = await auth();
  const userId = session?.user?.id;

  const [{ data: votes }, { data: savedState }] = userId
    ? await Promise.all([
        getMyVotes({ targetIds: [id], targetType: "question" }),
        hasSavedQuestion({ questionId: id }),
      ])
    : [{ data: {} as Record<string, "upvote" | "downvote"> }, { data: { saved: false } }];

  const { author, createdAt, answers, views, tags, title, content, upvotes, downvotes } = question;
  const isOwner = userId === author._id;

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between">
          <div className="flex items-center justify-start gap-1">
            <UserAvatar id={author._id} name={author.name} imageUrl={author.image} className="size-[22px]" fallbackClassName="text-[10px]" />
            <Link href={ROUTES.PROFILE(author._id)}>
              <p className="paragraph-semibold text-dark300_light700">{author.name}</p>
            </Link>
          </div>

          <div className="flex items-center justify-end gap-4">
            {isOwner && <EditDeleteAction type="question" itemId={id} redirectTo={ROUTES.HOME} />}
            <Votes
              targetType="question"
              targetId={id}
              upvotes={upvotes}
              downvotes={downvotes}
              userVote={votes?.[id] ?? null}
              isSignedIn={!!userId}
              isOwner={isOwner}
            />
            <SaveQuestion questionId={id} saved={!!savedState?.saved} isSignedIn={!!userId} />
          </div>
        </div>

        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full">{title}</h2>
      </div>

      <div className="mb-8 mt-5 flex flex-wrap gap-4">
        <Metric imgUrl="/icons/clock.svg" alt="clock icon" value={` asked ${getTimeStamp(createdAt)}`} title="" textStyles="small-regular text-dark400_light700" />
        <Metric imgUrl="/icons/message.svg" alt="message icon" value={answers} title="Answers" textStyles="small-regular text-dark400_light700" />
        <Metric imgUrl="/icons/eye.svg" alt="eye icon" value={formatNumber(views)} title="Views" textStyles="small-regular text-dark400_light700" />
      </div>

      <Preview content={content} />

      <div className="mt-8 flex flex-wrap gap-2">
        {tags.map((tag: Tag) => (
          <TagCard key={tag._id} _id={tag._id} name={tag.name} compact />
        ))}
      </div>

      <AllAnswers
        questionId={id}
        totalAnswers={answers}
        page={Number(page) || 1}
        filter={filter}
      />

      <section className="my-5">
        <h4 className="paragraph-semibold text-dark400_light800">Write your answer</h4>
        <AnswerForm questionId={id} isSignedIn={!!userId} />
      </section>
    </>
  );
};

export default QuestionDetails;

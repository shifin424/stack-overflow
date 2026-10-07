import Link from "next/link";

import ROUTES from "@/constants/routes";
import { getTimeStamp } from "@/lib/utils";

import Preview from "../Preview";
import UserAvatar from "../UserAvatar";
import EditDeleteAction from "../user/EditDeleteAction";
import Votes from "../votes/Votes";

interface Props extends Answer {
  containerClasses?: string;
  showReadMore?: boolean;
  showActionBtns?: boolean;
  showVotes?: boolean;
  userVote?: UserVote;
  isSignedIn?: boolean;
  isOwner?: boolean;
}

const AnswerCard = ({
  _id,
  author,
  content,
  createdAt,
  upvotes,
  downvotes,
  question,
  containerClasses,
  showReadMore = false,
  showActionBtns = false,
  showVotes = false,
  userVote = null,
  isSignedIn = false,
  isOwner = false,
}: Props) => (
  <article className={`light-border border-b py-10 ${containerClasses ?? ""}`}>
    <div className="mb-5 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
      <div className="flex flex-1 items-start gap-1 sm:items-center">
        <UserAvatar
          id={author._id}
          name={author.name}
          imageUrl={author.image}
          className="size-5 rounded-full object-cover max-sm:mt-2"
        />

        <Link
          href={ROUTES.PROFILE(author._id)}
          className="flex flex-col max-sm:ml-1 sm:flex-row sm:items-center"
        >
          <p className="body-semibold text-dark300_light700">{author.name ?? "Anonymous"}</p>
          <p className="small-regular text-light400_light500 ml-0.5 mt-0.5 line-clamp-1">
            <span className="max-sm:hidden"> • </span>
            answered {getTimeStamp(createdAt)}
          </p>
        </Link>
      </div>

      <div className="flex items-center justify-end gap-3">
        {showVotes && (
          <Votes
            targetType="answer"
            targetId={_id}
            upvotes={upvotes}
            downvotes={downvotes}
            userVote={userVote}
            isSignedIn={isSignedIn}
            isOwner={isOwner}
          />
        )}
        {showActionBtns && <EditDeleteAction type="answer" itemId={_id} />}
      </div>
    </div>

    <Preview content={content} />

    {showReadMore && (
      <Link href={ROUTES.QUESTION(question)} className="body-semibold relative z-10 font-space-grotesk text-primary-500">
        <p className="mt-1">Read more...</p>
      </Link>
    )}
  </article>
);

export default AnswerCard;

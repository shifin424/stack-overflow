"use client";

import Image from "next/image";
import { useState } from "react";

import { toast } from "@/hooks/use-toast";
import { createVote } from "@/lib/actions/vote.action";
import { formatNumber } from "@/lib/utils";

interface Props {
  targetType: "question" | "answer";
  targetId: string;
  upvotes: number;
  downvotes: number;
  userVote: UserVote;
  isSignedIn: boolean;
  isOwner: boolean;
}

const Votes = ({ targetType, targetId, upvotes, downvotes, userVote, isSignedIn, isOwner }: Props) => {
  const [pending, setPending] = useState<"upvote" | "downvote" | null>(null);

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!isSignedIn) {
      return toast({ title: "Please log in", description: "Only logged-in users can vote." });
    }
    if (isOwner) {
      return toast({ title: "Not allowed", description: "You can't vote on your own post." });
    }

    setPending(voteType);
    try {
      const result = await createVote({ targetId, targetType, voteType });

      if (!result.success) {
        return toast({
          title: "Failed to vote",
          description: result.error?.message,
          variant: "destructive",
        });
      }

      const removed = userVote === voteType;
      toast({
        title: removed ? `${voteType === "upvote" ? "Upvote" : "Downvote"} removed` : `${voteType === "upvote" ? "Upvoted" : "Downvoted"}`,
      });
    } finally {
      setPending(null);
    }
  };

  const button = (kind: "upvote" | "downvote", count: number) => {
    const active = userVote === kind;
    return (
      <div className="flex-center gap-1.5">
        <button
          type="button"
          aria-label={kind === "upvote" ? "Upvote" : "Downvote"}
          aria-pressed={active}
          disabled={pending !== null}
          onClick={() => handleVote(kind)}
          className="flex-center disabled:opacity-60"
        >
          <Image
            src={active ? `/icons/${kind}d.svg` : `/icons/${kind}.svg`}
            width={18}
            height={18}
            alt={kind}
            className={pending === kind ? "animate-pulse" : ""}
          />
        </button>

        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">{formatNumber(count)}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-center gap-2.5">
      {button("upvote", upvotes)}
      {button("downvote", downvotes)}
    </div>
  );
};

export default Votes;

"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import ROUTES from "@/constants/routes";
import Answer from "@/database/answer.model";
import Question from "@/database/question.model";
import User from "@/database/user.model";
import Vote from "@/database/vote.model";

import action from "./action";
import handleError from "../handlers/error";
import { ForbiddenError, NotFoundError } from "../http-errors";
import { REPUTATION } from "../reputation";
import { GetVotesSchema, CreateVoteSchema } from "../validations";

const reputationFor = (voteType: "upvote" | "downvote") =>
  voteType === "upvote" ? REPUTATION.UPVOTE_RECEIVED : REPUTATION.DOWNVOTE_RECEIVED;

/**
 * Casting the same vote twice removes it, casting the opposite vote switches it.
 * Counters and the author's reputation are kept in step inside one transaction.
 */
export async function createVote(params: CreateVoteParams): Promise<ActionResponse> {
  const validated = await action({ params, schema: CreateVoteSchema, authorize: true });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const { targetId, targetType, voteType } = validated.params!;
  const userId = validated.session!.user.id;

  const Target = targetType === "question" ? Question : Answer;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const target = await Target.findById(targetId).session(session);
    if (!target) throw new NotFoundError(targetType === "question" ? "Question" : "Answer");

    const authorId = target.author.toString();
    if (authorId === userId) throw new ForbiddenError("You can't vote on your own post");

    const existing = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    }).session(session);

    const counter = (type: string) => (type === "upvote" ? "upvotes" : "downvotes");
    let reputationDelta = 0;
    const inc: Record<string, number> = {};

    if (existing && existing.voteType === voteType) {
      await Vote.deleteOne({ _id: existing._id }, { session });
      inc[counter(voteType)] = -1;
      reputationDelta = -reputationFor(voteType);
    } else if (existing) {
      const previous = existing.voteType as "upvote" | "downvote";
      existing.voteType = voteType;
      await existing.save({ session });
      inc[counter(voteType)] = 1;
      inc[counter(previous)] = -1;
      reputationDelta = reputationFor(voteType) - reputationFor(previous);
    } else {
      await Vote.create([{ author: userId, actionId: targetId, actionType: targetType, voteType }], {
        session,
      });
      inc[counter(voteType)] = 1;
      reputationDelta = reputationFor(voteType);
    }

    await Target.updateOne({ _id: targetId }, { $inc: inc }, { session });
    await User.updateOne({ _id: authorId }, { $inc: { reputation: reputationDelta } }, { session });

    await session.commitTransaction();

    const questionId = targetType === "question" ? targetId : target.question.toString();
    revalidatePath(ROUTES.QUESTION(questionId));
    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

/** The current user's vote on each of the given targets; empty when signed out. */
export async function getMyVotes(
  params: GetVotesParams
): Promise<ActionResponse<Record<string, "upvote" | "downvote">>> {
  const validated = await action({ params, schema: GetVotesSchema });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  try {
    const session = await auth();
    if (!session?.user?.id) return { success: true, data: {} };

    const votes = await Vote.find({
      author: session.user.id,
      actionType: validated.params!.targetType,
      actionId: { $in: validated.params!.targetIds },
    }).lean();

    return {
      success: true,
      data: Object.fromEntries(votes.map((v) => [v.actionId.toString(), v.voteType])),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

"use server";

import mongoose, { SortOrder } from "mongoose";
import { revalidatePath } from "next/cache";

import ROUTES from "@/constants/routes";
import Answer from "@/database/answer.model";
import Interaction from "@/database/interaction.model";
import Question from "@/database/question.model";
import User from "@/database/user.model";
import Vote from "@/database/vote.model";

import action from "./action";
import handleError from "../handlers/error";
import { ForbiddenError, NotFoundError } from "../http-errors";
import { REPUTATION } from "../reputation";
import { serialize } from "../utils";
import { CreateAnswerSchema, DeleteSchema, GetAnswersSchema } from "../validations";

const SORTS: Record<string, Record<string, SortOrder>> = {
  latest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  popular: { upvotes: -1, createdAt: -1 },
};

export async function createAnswer(params: CreateAnswerParams): Promise<ActionResponse<Answer>> {
  const validated = await action({ params, schema: CreateAnswerSchema, authorize: true });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const { questionId, content } = validated.params!;
  const userId = validated.session!.user.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId).session(session);
    if (!question) throw new NotFoundError("Question");

    const [answer] = await Answer.create(
      [{ author: userId, question: questionId, content }],
      { session }
    );

    question.answers += 1;
    await question.save({ session });

    await User.updateOne(
      { _id: userId },
      { $inc: { reputation: REPUTATION.ANSWER_POSTED } },
      { session }
    );
    await Interaction.create(
      [{ user: userId, action: "post_answer", actionId: answer._id, actionType: "answer" }],
      { session }
    );

    await session.commitTransaction();

    revalidatePath(ROUTES.QUESTION(questionId));
    return { success: true, data: serialize<Answer>(answer) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function getAnswers(
  params: GetAnswersParams
): Promise<ActionResponse<Paginated<Answer>>> {
  const validated = await action({ params, schema: GetAnswersSchema });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const { questionId, page = 1, pageSize = 10, filter } = validated.params!;
  const skip = (page - 1) * pageSize;

  try {
    const [total, answers] = await Promise.all([
      Answer.countDocuments({ question: questionId }),
      Answer.find({ question: questionId })
        .populate("author", "_id name username image")
        .sort(SORTS[filter ?? ""] ?? SORTS.latest)
        .skip(skip)
        .limit(pageSize)
        .lean(),
    ]);

    return {
      success: true,
      data: {
        items: serialize<Answer[]>(answers),
        isNext: total > skip + answers.length,
        total,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteAnswer(params: Pick<DeleteParams, "targetId">): Promise<ActionResponse> {
  const validated = await action({
    params: { ...params, targetType: "answer" as const },
    schema: DeleteSchema,
    authorize: true,
  });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const { targetId } = validated.params!;
  const userId = validated.session!.user.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const answer = await Answer.findById(targetId).session(session);
    if (!answer) throw new NotFoundError("Answer");
    if (answer.author.toString() !== userId) {
      throw new ForbiddenError("You can only delete your own answers");
    }

    await Question.updateOne({ _id: answer.question }, { $inc: { answers: -1 } }, { session });
    await Vote.deleteMany({ actionId: targetId, actionType: "answer" }, { session });
    await Answer.findByIdAndDelete(targetId, { session });

    await session.commitTransaction();

    revalidatePath(ROUTES.QUESTION(answer.question.toString()));
    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

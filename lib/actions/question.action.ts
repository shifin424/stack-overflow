"use server";

import mongoose, { QueryFilter, SortOrder } from "mongoose";
import { revalidatePath } from "next/cache";

import ROUTES from "@/constants/routes";
import Answer from "@/database/answer.model";
import Collection from "@/database/collection.model";
import Interaction from "@/database/interaction.model";
import Question from "@/database/question.model";
import TagQuestion from "@/database/tag-question.model";
import Tag, { ITagDoc } from "@/database/tag.model";
import User from "@/database/user.model";
import Vote from "@/database/vote.model";

import action from "./action";
import handleError from "../handlers/error";
import { ForbiddenError, NotFoundError } from "../http-errors";
import { REPUTATION } from "../reputation";
import { escapeRegex, serialize } from "../utils";
import {
  AskQuestionSchema,
  DeleteSchema,
  EditQuestionSchema,
  GetQuestionSchema,
  IncrementViewsSchema,
  PaginatedSearchParamsSchema,
} from "../validations";

const AUTHOR_FIELDS = "name username image";

const withTags = (tags: string[], questionId: unknown, session: mongoose.ClientSession) =>
  Promise.all(
    tags.map(async (title) => {
      const tag = await Tag.findOneAndUpdate(
        { name: { $regex: `^${escapeRegex(title)}$`, $options: "i" } },
        { $setOnInsert: { name: title.toLowerCase() }, $inc: { questions: 1 } },
        { upsert: true, new: true, session }
      );
      await TagQuestion.create([{ tag: tag._id, question: questionId }], { session });
      return tag._id;
    })
  );

export async function createQuestion(
  params: CreateQuestionParams
): Promise<ActionResponse<Question>> {
  const validated = await action({ params, schema: AskQuestionSchema, authorize: true });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const { title, content, tags } = validated.params!;
  const userId = validated.session!.user.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [question] = await Question.create([{ title, content, author: userId }], { session });

    const tagIds = await withTags(tags, question._id, session);
    await Question.updateOne({ _id: question._id }, { $set: { tags: tagIds } }, { session });

    await User.updateOne(
      { _id: userId },
      { $inc: { reputation: REPUTATION.QUESTION_ASKED } },
      { session }
    );
    await Interaction.create(
      [{ user: userId, action: "ask_question", actionId: question._id, actionType: "question" }],
      { session }
    );

    await session.commitTransaction();

    revalidatePath(ROUTES.HOME);
    return { success: true, data: serialize<Question>(question) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function editQuestion(
  params: EditQuestionParams
): Promise<ActionResponse<Question>> {
  const validated = await action({ params, schema: EditQuestionSchema, authorize: true });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const { title, content, tags, questionId } = validated.params!;
  const userId = validated.session!.user.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId).populate("tags").session(session);
    if (!question) throw new NotFoundError("Question");
    if (question.author.toString() !== userId) {
      throw new ForbiddenError("You can only edit your own questions");
    }

    if (question.title !== title || question.content !== content) {
      question.title = title;
      question.content = content;
      await question.save({ session });
    }

    const wanted = new Map(tags.map((t) => [t.toLowerCase(), t]));
    const current: ITagDoc[] = question.tags;

    const removed = current.filter((t) => !wanted.has(t.name.toLowerCase()));
    const currentNames = new Set(current.map((t) => t.name.toLowerCase()));
    const added = [...wanted.entries()].filter(([name]) => !currentNames.has(name)).map(([, t]) => t);

    if (removed.length > 0) {
      const removedIds = removed.map((t) => t._id);
      await Tag.updateMany({ _id: { $in: removedIds } }, { $inc: { questions: -1 } }, { session });
      await TagQuestion.deleteMany({ tag: { $in: removedIds }, question: questionId }, { session });
    }

    if (added.length > 0) {
      await withTags(added, questionId, session);
    }

    const tagIds = (await TagQuestion.find({ question: questionId }).session(session)).map(
      (tq) => tq.tag
    );
    await Question.updateOne({ _id: questionId }, { $set: { tags: tagIds } }, { session });

    await session.commitTransaction();

    revalidatePath(ROUTES.QUESTION(questionId));
    revalidatePath(ROUTES.HOME);
    return { success: true, data: serialize<Question>(question) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function getQuestion(params: GetQuestionParams): Promise<ActionResponse<Question>> {
  const validated = await action({ params, schema: GetQuestionSchema });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  try {
    const question = await Question.findById(validated.params!.questionId)
      .populate("tags", "_id name")
      .populate("author", `_id ${AUTHOR_FIELDS}`)
      .lean();

    if (!question) throw new NotFoundError("Question");

    return { success: true, data: serialize<Question>(question) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

const SORTS: Record<string, Record<string, SortOrder>> = {
  newest: { createdAt: -1 },
  popular: { upvotes: -1, createdAt: -1 },
  unanswered: { createdAt: -1 },
  recommended: { views: -1, createdAt: -1 },
};

export async function getQuestions(
  params: PaginatedSearchParams
): Promise<ActionResponse<Paginated<Question>>> {
  const validated = await action({ params, schema: PaginatedSearchParamsSchema });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const { page = 1, pageSize = 10, query, filter } = validated.params!;
  const skip = (page - 1) * pageSize;

  const filterQuery: QueryFilter<typeof Question> = {};

  if (filter === "unanswered") filterQuery.answers = 0;

  if (query) {
    const regex = new RegExp(escapeRegex(query), "i");
    filterQuery.$or = [{ title: { $regex: regex } }, { content: { $regex: regex } }];
  }

  try {
    const [total, questions] = await Promise.all([
      Question.countDocuments(filterQuery),
      Question.find(filterQuery)
        .populate("tags", "_id name")
        .populate("author", `_id ${AUTHOR_FIELDS}`)
        .lean()
        .sort(SORTS[filter ?? ""] ?? SORTS.newest)
        .skip(skip)
        .limit(pageSize),
    ]);

    return {
      success: true,
      data: {
        items: serialize<Question[]>(questions),
        isNext: total > skip + questions.length,
        total,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getHotQuestions(): Promise<ActionResponse<Pick<Question, "_id" | "title">[]>> {
  try {
    await action({});
    const questions = await Question.find()
      .select("_id title")
      .sort({ views: -1, upvotes: -1 })
      .limit(5)
      .lean();

    return { success: true, data: serialize(questions) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function incrementViews(
  params: GetQuestionParams
): Promise<ActionResponse<{ views: number }>> {
  const validated = await action({ params, schema: IncrementViewsSchema });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  try {
    const question = await Question.findByIdAndUpdate(
      validated.params!.questionId,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!question) throw new NotFoundError("Question");

    return { success: true, data: { views: question.views } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

/** Deletes a question together with everything that hangs off it. */
export async function deleteQuestion(params: Pick<DeleteParams, "targetId">): Promise<ActionResponse> {
  const validated = await action({
    params: { ...params, targetType: "question" as const },
    schema: DeleteSchema,
    authorize: true,
  });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const { targetId } = validated.params!;
  const userId = validated.session!.user.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(targetId).session(session);
    if (!question) throw new NotFoundError("Question");
    if (question.author.toString() !== userId) {
      throw new ForbiddenError("You can only delete your own questions");
    }

    const answerIds = (await Answer.find({ question: targetId }).select("_id").session(session)).map(
      (a) => a._id
    );

    await Collection.deleteMany({ question: targetId }, { session });
    await TagQuestion.deleteMany({ question: targetId }, { session });

    if (question.tags.length > 0) {
      await Tag.updateMany({ _id: { $in: question.tags } }, { $inc: { questions: -1 } }, { session });
      await Tag.deleteMany({ _id: { $in: question.tags }, questions: { $lte: 0 } }, { session });
    }

    await Vote.deleteMany({ actionId: targetId, actionType: "question" }, { session });
    await Vote.deleteMany({ actionId: { $in: answerIds }, actionType: "answer" }, { session });
    await Answer.deleteMany({ question: targetId }, { session });
    await Question.findByIdAndDelete(targetId, { session });

    await session.commitTransaction();

    revalidatePath(ROUTES.PROFILE(userId));
    revalidatePath(ROUTES.HOME);
    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

"use server";

import { QueryFilter } from "mongoose";
import { revalidatePath } from "next/cache";

import ROUTES from "@/constants/routes";
import Collection from "@/database/collection.model";
import Question from "@/database/question.model";

import action from "./action";
import handleError from "../handlers/error";
import { NotFoundError } from "../http-errors";
import { escapeRegex, serialize } from "../utils";
import { CollectionBaseSchema, PaginatedSearchParamsSchema } from "../validations";

export async function toggleSaveQuestion(
  params: CollectionBaseParams
): Promise<ActionResponse<{ saved: boolean }>> {
  const validated = await action({ params, schema: CollectionBaseSchema, authorize: true });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const { questionId } = validated.params!;
  const userId = validated.session!.user.id;

  try {
    const question = await Question.exists({ _id: questionId });
    if (!question) throw new NotFoundError("Question");

    const existing = await Collection.findOne({ question: questionId, author: userId });

    if (existing) {
      await Collection.deleteOne({ _id: existing._id });
    } else {
      await Collection.create({ question: questionId, author: userId });
    }

    revalidatePath(ROUTES.QUESTION(questionId));
    revalidatePath(ROUTES.COLLECTION);
    return { success: true, data: { saved: !existing } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function hasSavedQuestion(
  params: CollectionBaseParams
): Promise<ActionResponse<{ saved: boolean }>> {
  const validated = await action({ params, schema: CollectionBaseSchema, authorize: true });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  try {
    const saved = await Collection.exists({
      question: validated.params!.questionId,
      author: validated.session!.user.id,
    });

    return { success: true, data: { saved: !!saved } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getSavedQuestions(
  params: PaginatedSearchParams
): Promise<ActionResponse<Paginated<Question>>> {
  const validated = await action({
    params,
    schema: PaginatedSearchParamsSchema,
    authorize: true,
  });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const { page = 1, pageSize = 10, query, filter } = validated.params!;
  const userId = validated.session!.user.id;
  const skip = (page - 1) * pageSize;

  const filterQuery: QueryFilter<typeof Collection> = { author: userId };

  if (query) {
    const regex = new RegExp(escapeRegex(query), "i");
    filterQuery.question = {
      $in: await Question.find({
        $or: [{ title: { $regex: regex } }, { content: { $regex: regex } }],
      }).distinct("_id"),
    };
  }

  try {
    const [total, saved] = await Promise.all([
      Collection.countDocuments(filterQuery),
      Collection.find(filterQuery)
        .populate({
          path: "question",
          populate: [
            { path: "tags", select: "_id name" },
            { path: "author", select: "_id name username image" },
          ],
        })
        .sort({ createdAt: filter === "oldest" ? 1 : -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
    ]);

    return {
      success: true,
      data: {
        items: serialize<Question[]>(saved.map((s) => s.question).filter(Boolean)),
        isNext: total > skip + saved.length,
        total,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

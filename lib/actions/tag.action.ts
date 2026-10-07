"use server";

import { QueryFilter, SortOrder } from "mongoose";

import Question from "@/database/question.model";
import Tag from "@/database/tag.model";

import action from "./action";
import handleError from "../handlers/error";
import { NotFoundError } from "../http-errors";
import { escapeRegex, serialize } from "../utils";
import { GetTagQuestionsSchema, PaginatedSearchParamsSchema } from "../validations";

const SORTS: Record<string, Record<string, SortOrder>> = {
  popular: { questions: -1 },
  recent: { createdAt: -1 },
  oldest: { createdAt: 1 },
  name: { name: 1 },
};

export async function getTags(
  params: PaginatedSearchParams
): Promise<ActionResponse<Paginated<Tag>>> {
  const validated = await action({ params, schema: PaginatedSearchParamsSchema });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const { page = 1, pageSize = 10, query, filter } = validated.params!;
  const skip = (page - 1) * pageSize;

  const filterQuery: QueryFilter<typeof Tag> = {};
  if (query) filterQuery.name = { $regex: escapeRegex(query), $options: "i" };

  try {
    const [total, tags] = await Promise.all([
      Tag.countDocuments(filterQuery),
      Tag.find(filterQuery)
        .sort(SORTS[filter ?? ""] ?? SORTS.popular)
        .skip(skip)
        .limit(pageSize)
        .lean(),
    ]);

    return {
      success: true,
      data: { items: serialize<Tag[]>(tags), isNext: total > skip + tags.length, total },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getTagQuestions(
  params: GetTagQuestionsParams
): Promise<ActionResponse<{ tag: Tag; questions: Question[]; isNext: boolean; total: number }>> {
  const validated = await action({ params, schema: GetTagQuestionsSchema });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const { tagId, page = 1, pageSize = 10, query } = validated.params!;
  const skip = (page - 1) * pageSize;

  try {
    const tag = await Tag.findById(tagId).lean();
    if (!tag) throw new NotFoundError("Tag");

    const filterQuery: QueryFilter<typeof Question> = { tags: tagId };
    if (query) filterQuery.title = { $regex: escapeRegex(query), $options: "i" };

    const [total, questions] = await Promise.all([
      Question.countDocuments(filterQuery),
      Question.find(filterQuery)
        .populate("tags", "_id name")
        .populate("author", "_id name username image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
    ]);

    return {
      success: true,
      data: {
        tag: serialize<Tag>(tag),
        questions: serialize<Question[]>(questions),
        isNext: total > skip + questions.length,
        total,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getPopularTags(): Promise<ActionResponse<Tag[]>> {
  try {
    await action({});
    const tags = await Tag.find({ questions: { $gt: 0 } })
      .sort({ questions: -1 })
      .limit(5)
      .lean();

    return { success: true, data: serialize<Tag[]>(tags) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

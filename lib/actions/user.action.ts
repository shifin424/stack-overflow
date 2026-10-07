"use server";

import mongoose, { QueryFilter, PipelineStage, SortOrder } from "mongoose";
import { revalidatePath } from "next/cache";

import ROUTES from "@/constants/routes";
import Answer from "@/database/answer.model";
import Question from "@/database/question.model";
import User from "@/database/user.model";

import action from "./action";
import handleError from "../handlers/error";
import { NotFoundError, RequestError } from "../http-errors";
import { assignBadges } from "../reputation";
import { escapeRegex, serialize } from "../utils";
import {
  GetUserAnswersSchema,
  GetUserQuestionsSchema,
  GetUserSchema,
  PaginatedSearchParamsSchema,
  UpdateUserSchema,
} from "../validations";

const SORTS: Record<string, Record<string, SortOrder>> = {
  popular: { reputation: -1 },
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
};

export async function getUsers(
  params: PaginatedSearchParams
): Promise<ActionResponse<Paginated<User>>> {
  const validated = await action({ params, schema: PaginatedSearchParamsSchema });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const { page = 1, pageSize = 10, query, filter } = validated.params!;
  const skip = (page - 1) * pageSize;

  const filterQuery: QueryFilter<typeof User> = {};
  if (query) {
    const regex = new RegExp(escapeRegex(query), "i");
    filterQuery.$or = [{ name: { $regex: regex } }, { username: { $regex: regex } }];
  }

  try {
    const [total, users] = await Promise.all([
      User.countDocuments(filterQuery),
      User.find(filterQuery)
        .select("-email")
        .sort(SORTS[filter ?? ""] ?? SORTS.popular)
        .skip(skip)
        .limit(pageSize)
        .lean(),
    ]);

    return {
      success: true,
      data: { items: serialize<User[]>(users), isNext: total > skip + users.length, total },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUser(
  params: GetUserParams
): Promise<ActionResponse<{ user: User; totalQuestions: number; totalAnswers: number }>> {
  const validated = await action({ params, schema: GetUserSchema });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const { userId } = validated.params!;

  try {
    const user = await User.findById(userId).select("-email").lean();
    if (!user) throw new NotFoundError("User");

    const [totalQuestions, totalAnswers] = await Promise.all([
      Question.countDocuments({ author: userId }),
      Answer.countDocuments({ author: userId }),
    ]);

    return {
      success: true,
      data: { user: serialize<User>(user), totalQuestions, totalAnswers },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserQuestions(
  params: GetUserQuestionsParams
): Promise<ActionResponse<Paginated<Question>>> {
  const validated = await action({ params, schema: GetUserQuestionsSchema });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const { userId, page = 1, pageSize = 10 } = validated.params!;
  const skip = (page - 1) * pageSize;

  try {
    const [total, questions] = await Promise.all([
      Question.countDocuments({ author: userId }),
      Question.find({ author: userId })
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
        items: serialize<Question[]>(questions),
        isNext: total > skip + questions.length,
        total,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserAnswers(
  params: GetUserAnswersParams
): Promise<ActionResponse<Paginated<Answer>>> {
  const validated = await action({ params, schema: GetUserAnswersSchema });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const { userId, page = 1, pageSize = 10 } = validated.params!;
  const skip = (page - 1) * pageSize;

  try {
    const [total, answers] = await Promise.all([
      Answer.countDocuments({ author: userId }),
      Answer.find({ author: userId })
        .populate("author", "_id name username image")
        .sort({ upvotes: -1, createdAt: -1 })
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

export async function getUserTopTags(
  params: GetUserParams
): Promise<ActionResponse<{ _id: string; name: string; count: number }[]>> {
  const validated = await action({ params, schema: GetUserSchema });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  try {
    const pipeline: PipelineStage[] = [
      { $match: { author: new mongoose.Types.ObjectId(validated.params!.userId) } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $lookup: { from: "tags", localField: "_id", foreignField: "_id", as: "tag" } },
      { $unwind: "$tag" },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: "$tag._id", name: "$tag.name", count: 1 } },
    ];

    const tags = await Question.aggregate(pipeline);
    return { success: true, data: serialize(tags) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserStats(params: GetUserParams): Promise<ActionResponse<UserStats>> {
  const validated = await action({ params, schema: GetUserSchema });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const author = new mongoose.Types.ObjectId(validated.params!.userId);

  try {
    const sum = (field: "upvotes" | "views") => ({
      $group: { _id: null, count: { $sum: `$${field}` } },
    });

    const [totalQuestions, totalAnswers, questionUpvotes, answerUpvotes, questionViews] =
      await Promise.all([
        Question.countDocuments({ author }),
        Answer.countDocuments({ author }),
        Question.aggregate([{ $match: { author } }, sum("upvotes")]),
        Answer.aggregate([{ $match: { author } }, sum("upvotes")]),
        Question.aggregate([{ $match: { author } }, sum("views")]),
      ]);

    const badges = assignBadges({
      QUESTION_COUNT: totalQuestions,
      ANSWER_COUNT: totalAnswers,
      TOTAL_UPVOTES: (questionUpvotes[0]?.count ?? 0) + (answerUpvotes[0]?.count ?? 0),
      TOTAL_VIEWS: questionViews[0]?.count ?? 0,
    });

    return { success: true, data: { totalQuestions, totalAnswers, badges } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateUser(params: UpdateUserParams): Promise<ActionResponse<User>> {
  const validated = await action({ params, schema: UpdateUserSchema, authorize: true });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const userId = validated.session!.user.id;
  const { name, username, bio, location, portfolio } = validated.params!;

  try {
    const taken = await User.exists({ username, _id: { $ne: userId } });
    if (taken) throw new RequestError(409, "Username is already taken");

    const user = await User.findByIdAndUpdate(
      userId,
      { name, username, bio, location, portfolio },
      { new: true }
    ).lean();
    if (!user) throw new NotFoundError("User");

    revalidatePath(ROUTES.PROFILE(userId));
    revalidatePath(ROUTES.COMMUNITY);
    return { success: true, data: serialize<User>(user) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

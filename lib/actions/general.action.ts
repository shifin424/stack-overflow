"use server";

import Answer from "@/database/answer.model";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import User from "@/database/user.model";

import action from "./action";
import handleError from "../handlers/error";
import { escapeRegex, serialize } from "../utils";
import { GlobalSearchSchema } from "../validations";

const SEARCH_LIMIT = 4;

export async function globalSearch(
  params: GlobalSearchParams
): Promise<ActionResponse<GlobalSearchResult[]>> {
  const validated = await action({ params, schema: GlobalSearchSchema });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const { query, type } = validated.params!;
  const regex = { $regex: escapeRegex(query), $options: "i" };

  const sources = [
    { model: Question, field: "title", type: "question" as const },
    { model: Answer, field: "content", type: "answer" as const },
    { model: User, field: "name", type: "user" as const },
    { model: Tag, field: "name", type: "tag" as const },
  ];

  try {
    const selected = type ? sources.filter((s) => s.type === type) : sources;

    const groups = await Promise.all(
      selected.map(async ({ model, field, type }) => {
        const docs = await model
          .find({ [field]: regex })
          .limit(type === "answer" || !params.type ? SEARCH_LIMIT : 8)
          .lean();

        return docs.map((doc: Record<string, unknown> & { _id: unknown }) => ({
          id: type === "answer" ? String(doc.question) : String(doc._id),
          type,
          title:
            type === "answer"
              ? `${String(doc.content).slice(0, 80)}…`
              : String(doc[field]),
        }));
      })
    );

    return { success: true, data: serialize<GlobalSearchResult[]>(groups.flat()) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

interface SignInWithOAuthParams {
    provider: "github";
    providerAccountId: string;
    user: {
        email: string;
        name: string;
        image: string;
        username: string;
    }
}

interface AuthCredentials {
    name: string;
    username: string;
    email: string;
    password: string;
}

interface CreateQuestionParams {
    title: string;
    content: string;
    tags: string[];
}

interface EditQuestionParams extends CreateQuestionParams {
    questionId: string;
}

interface GetQuestionParams {
    questionId: string;
}

interface CreateAnswerParams {
    questionId: string;
    content: string;
}

interface GetAnswersParams extends PaginatedSearchParams {
    questionId: string;
}

interface DeleteParams {
    targetId: string;
    targetType: "question" | "answer";
}

interface CreateVoteParams {
    targetId: string;
    targetType: "question" | "answer";
    voteType: "upvote" | "downvote";
}

interface GetVotesParams {
    targetIds: string[];
    targetType: "question" | "answer";
}

type UserVote = "upvote" | "downvote" | null;

interface CollectionBaseParams {
    questionId: string;
}

interface GetTagQuestionsParams extends Omit<PaginatedSearchParams, "filter"> {
    tagId: string;
}

interface GetUserParams {
    userId: string;
}

interface GetUserQuestionsParams extends Omit<PaginatedSearchParams, "query" | "filter" | "sort"> {
    userId: string;
}

interface GetUserAnswersParams extends Omit<PaginatedSearchParams, "query" | "filter" | "sort"> {
    userId: string;
}

interface UpdateUserParams {
    name: string;
    username: string;
    bio?: string;
    location?: string;
    portfolio?: string;
}

interface GlobalSearchParams {
    query: string;
    type?: "question" | "answer" | "user" | "tag" | null;
}

interface GlobalSearchResult {
    id: string;
    type: "question" | "answer" | "user" | "tag";
    title: string;
}

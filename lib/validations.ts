import { z } from "zod";

export const SignInSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please provide a valid email address." }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long. " })
    .max(100, { message: "Password cannot exceed 100 characters." }),
});

export const SignUpSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(30, { message: "Username cannot exceed 30 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores.",
    }),

  name: z
    .string()
    .min(1, { message: "Name is required." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .regex(/^[a-zA-Z\s]+$/, {
      message: "Name can only contain letters and spaces.",
    }),

  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Please provide a valid email address." }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(100, { message: "Password cannot exceed 100 characters." })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character.",
    }),
});


export const AskQuestionSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title is required." })
    .max(100, { message: "Title cannot exceed 100 characters." }),

  content: z.string().min(1, { message: "Body is required." }),
  tags: z
    .array(
      z
        .string()
        .min(1, { message: "Tag is required." })
        .max(30, { message: "Tag cannot exceed 30 characters." })
    )
    .min(1, { message: "At least one tag is required." })
    .max(3, { message: "Cannot add more than 3 tags." }),
});


export const UserSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." }),
  email: z.string().email({ message: "Please provide a valid email address." }),
  bio: z.string().optional(),
  image: z.string().url({ message: "Please provide a valid URL." }).optional(),
  location: z.string().optional(),
  portfolio: z
    .string()
    .url({ message: "Please provide a valid URL." })
    .optional(),
  reputation: z.number().optional(),
}); 

export const AccountSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required." }),
  name: z.string().min(1, { message: "Name is required." }),
  image: z.string().url({ message: "Please provide a valid URL." }).optional(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(100, { message: "Password cannot exceed 100 characters." })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character.",
    })
    .optional(),
  provider: z.string().min(1, { message: "Provider is required." }),
  providerAccountId: z
    .string()
    .min(1, { message: "Provider Account ID is required." }),
});

export const SignInWithOAuthSchema = z.object({
  provider: z.enum(["google", "github"]),
  providerAccountId: z
    .string()
    .min(1, { message: "Provider Account ID is required." }),
  user: z.object({
    name: z.string().min(1, { message: "Name is required." }),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long." }),
    email: z
      .string()
      .email({ message: "Please provide a valid email address." }),
    image: z.string().url("Invalid image URL").optional(),
  }),
});

export const PaginatedSearchParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  query: z.string().optional(),
  filter: z.string().optional(),
  sort: z.string().optional(),
});

const ObjectIdSchema = (label: string) =>
  z.string().regex(/^[a-f\d]{24}$/i, { message: `${label} is invalid.` });

export const EditQuestionSchema = AskQuestionSchema.extend({
  questionId: ObjectIdSchema("Question ID"),
});

export const GetQuestionSchema = z.object({
  questionId: ObjectIdSchema("Question ID"),
});

export const IncrementViewsSchema = GetQuestionSchema;

export const AnswerSchema = z.object({
  content: z
    .string()
    .min(100, { message: "Answer has to have more than 100 characters." }),
});

export const CreateAnswerSchema = AnswerSchema.extend({
  questionId: ObjectIdSchema("Question ID"),
});

export const GetAnswersSchema = PaginatedSearchParamsSchema.extend({
  questionId: ObjectIdSchema("Question ID"),
});

export const DeleteSchema = z.object({
  targetId: ObjectIdSchema("Target ID"),
  targetType: z.enum(["question", "answer"]),
});

export const CreateVoteSchema = z.object({
  targetId: ObjectIdSchema("Target ID"),
  targetType: z.enum(["question", "answer"]),
  voteType: z.enum(["upvote", "downvote"]),
});

export const GetVotesSchema = z.object({
  targetIds: z.array(ObjectIdSchema("Target ID")).max(100),
  targetType: z.enum(["question", "answer"]),
});

export const CollectionBaseSchema = z.object({
  questionId: ObjectIdSchema("Question ID"),
});

export const GetTagQuestionsSchema = PaginatedSearchParamsSchema.extend({
  tagId: ObjectIdSchema("Tag ID"),
});

export const GetUserSchema = z.object({
  userId: ObjectIdSchema("User ID"),
});

export const GetUserQuestionsSchema = PaginatedSearchParamsSchema.extend({
  userId: ObjectIdSchema("User ID"),
});

export const GetUserAnswersSchema = GetUserQuestionsSchema;

export const UpdateUserSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required." })
    .max(50, { message: "Name cannot exceed 50 characters." }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(30, { message: "Username cannot exceed 30 characters." })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: "Username can only contain letters, numbers, hyphens and underscores.",
    }),
  bio: z.string().max(300, { message: "Bio cannot exceed 300 characters." }).optional(),
  location: z.string().max(60, { message: "Location cannot exceed 60 characters." }).optional(),
  portfolio: z
    .string()
    .url({ message: "Please provide a valid URL." })
    .optional()
    .or(z.literal("")),
});

export const GlobalSearchSchema = z.object({
  query: z.string().min(1),
  type: z.enum(["question", "answer", "user", "tag"]).nullable().optional(),
});

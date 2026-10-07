import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import QuestionForm from "@/components/forms/QuestionForm";
import ROUTES from "@/constants/routes";
import { getQuestion } from "@/lib/actions/question.action";

const EditQuestion = async ({ params }: RouteParams) => {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) return redirect(ROUTES.SIGN_IN);

  const { data: question, success } = await getQuestion({ questionId: id });
  if (!success || !question) return notFound();

  if (question.author._id !== session.user.id) return redirect(ROUTES.QUESTION(id));

  return (
    <main>
      <h1 className="h1-bold text-dark100_light900">Edit Question</h1>
      <div className="mt-9">
        <QuestionForm question={question} isEdit />
      </div>
    </main>
  );
};

export default EditQuestion;

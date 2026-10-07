"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import ROUTES from "@/constants/routes";
import { toast } from "@/hooks/use-toast";
import { createAnswer } from "@/lib/actions/answer.action";
import { AnswerSchema } from "@/lib/validations";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface Props {
  questionId: string;
  isSignedIn: boolean;
}

const AnswerForm = ({ questionId, isSignedIn }: Props) => {
  // Bumping the key remounts the editor, which is how it gets cleared after posting.
  const [editorKey, setEditorKey] = useState(0);

  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: { content: "" },
  });

  const handleSubmit = async (values: z.infer<typeof AnswerSchema>) => {
    const result = await createAnswer({ questionId, content: values.content });

    if (!result.success) {
      return toast({
        title: "Failed to post answer",
        description: result.error?.message,
        variant: "destructive",
      });
    }

    form.reset();
    setEditorKey((key) => key + 1);
    toast({ title: "Success", description: "Your answer has been posted" });
  };

  if (!isSignedIn) {
    return (
      <div className="light-border background-light800_dark300 mt-8 flex-between flex-wrap gap-3 rounded-lg border p-6">
        <p className="paragraph-regular text-dark400_light800">Log in to write an answer.</p>
        <Button
          nativeButton={false}
          render={<Link href={ROUTES.SIGN_IN} />}
          className="primary-gradient !text-light-900"
        >
          Log in
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form className="mt-6 flex w-full flex-col gap-10" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormControl>
                <Editor key={editorKey} value={field.value} editorRef={null} fieldChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="primary-gradient w-fit !text-light-900"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Posting...
              </>
            ) : (
              "Post Answer"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AnswerForm;

"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import { toast } from "@/hooks/use-toast";
import { deleteAnswer } from "@/lib/actions/answer.action";
import { deleteQuestion } from "@/lib/actions/question.action";

interface Props {
  type: "question" | "answer";
  itemId: string;
  /** Where to go once the item is gone; defaults to refreshing the current page. */
  redirectTo?: string;
}

const EditDeleteAction = ({ type, itemId, redirectTo }: Props) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result =
        type === "question"
          ? await deleteQuestion({ targetId: itemId })
          : await deleteAnswer({ targetId: itemId });

      if (!result.success) {
        return toast({ title: "Error", description: result.error?.message, variant: "destructive" });
      }

      toast({ title: `${type === "question" ? "Question" : "Answer"} deleted` });
      setOpen(false);
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`flex items-center justify-end gap-3 ${type === "answer" ? "" : "max-sm:w-full"}`}>
      {type === "question" && (
        <button
          type="button"
          aria-label="Edit question"
          onClick={() => router.push(ROUTES.EDIT_QUESTION(itemId))}
          className="flex-center"
        >
          <Image src="/icons/edit.svg" alt="edit" width={14} height={14} />
        </button>
      )}

      <button type="button" aria-label={`Delete ${type}`} onClick={() => setOpen(true)} className="flex-center">
        <Image src="/icons/trash.svg" alt="delete" width={14} height={14} />
      </button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="background-light800_dark300">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your {type}
              {type === "question" ? " along with its answers" : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              disabled={isDeleting}
              onClick={handleDelete}
              className="primary-gradient !text-light-900"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditDeleteAction;

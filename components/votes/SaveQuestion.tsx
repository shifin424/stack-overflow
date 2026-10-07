"use client";

import Image from "next/image";
import { useState } from "react";

import { toast } from "@/hooks/use-toast";
import { toggleSaveQuestion } from "@/lib/actions/collection.action";

interface Props {
  questionId: string;
  saved: boolean;
  isSignedIn: boolean;
}

const SaveQuestion = ({ questionId, saved, isSignedIn }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!isSignedIn) {
      return toast({ title: "Please log in", description: "Only logged-in users can save questions." });
    }

    setIsLoading(true);
    try {
      const result = await toggleSaveQuestion({ questionId });

      if (!result.success) {
        return toast({ title: "Error", description: result.error?.message, variant: "destructive" });
      }

      toast({ title: result.data?.saved ? "Question saved" : "Question removed from your collection" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from collection" : "Save question"}
      disabled={isLoading}
      onClick={handleSave}
      className="flex-center disabled:opacity-60"
    >
      <Image
        src={saved ? "/icons/star-filled.svg" : "/icons/star.svg"}
        width={18}
        height={18}
        alt="save"
        className={isLoading ? "animate-pulse" : ""}
      />
    </button>
  );
};

export default SaveQuestion;

import { QuestionListSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

const shade = "background-light800_dark300";

const Loading = () => (
  <>
    <div className="flex flex-col items-start gap-4 lg:flex-row">
      <Skeleton className={`size-[140px] rounded-full ${shade}`} />
      <div className="mt-3 space-y-3">
        <Skeleton className={`h-8 w-48 ${shade}`} />
        <Skeleton className={`h-5 w-32 ${shade}`} />
        <Skeleton className={`h-5 w-72 ${shade}`} />
      </div>
    </div>
    <div className="mt-10 grid grid-cols-1 gap-5 xs:grid-cols-2 md:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className={`h-24 ${shade}`} />
      ))}
    </div>
    <QuestionListSkeleton count={3} />
  </>
);

export default Loading;

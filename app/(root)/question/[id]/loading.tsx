import { Skeleton } from "@/components/ui/skeleton";

const shade = "background-light800_dark300";

const Loading = () => (
  <>
    <div className="flex items-center gap-2">
      <Skeleton className={`size-[22px] rounded-full ${shade}`} />
      <Skeleton className={`h-5 w-32 ${shade}`} />
    </div>
    <Skeleton className={`mt-4 h-8 w-3/4 ${shade}`} />
    <Skeleton className={`mt-6 h-4 w-64 ${shade}`} />
    <div className="mt-8 space-y-3">
      <Skeleton className={`h-4 w-full ${shade}`} />
      <Skeleton className={`h-4 w-full ${shade}`} />
      <Skeleton className={`h-4 w-2/3 ${shade}`} />
    </div>
    <Skeleton className={`mt-10 h-48 w-full ${shade}`} />
  </>
);

export default Loading;

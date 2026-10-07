"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";
import { cn } from "@/lib/utils";

interface Props {
  filters: { name: string; value: string }[];
  placeholder?: string;
  otherClasses?: string;
  containerClasses?: string;
  /** Value treated as "no filter" and kept out of the URL. */
  defaultValue?: string;
}

const CommonFilter = ({
  filters,
  placeholder = "Select a filter",
  otherClasses,
  containerClasses,
  defaultValue,
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("filter") ?? defaultValue ?? null;

  const handleChange = (value: string | null) => {
    if (!value) return;

    const params = searchParams.toString();
    const url =
      value === defaultValue
        ? removeKeysFromUrlQuery({ params, keysToRemove: ["filter", "page"] })
        : formUrlQuery({ params, key: "filter", value, keysToRemove: ["page"] });

    router.push(url, { scroll: false });
  };

  return (
    <div className={cn("relative", containerClasses)}>
      <Select
        value={current}
        onValueChange={handleChange}
        items={filters.map((f) => ({ value: f.value, label: f.name }))}
      >
        <SelectTrigger
          className={cn(
            "body-regular light-border background-light800_dark300 text-dark500_light700 min-h-[56px] w-full border px-5 py-2.5",
            otherClasses
          )}
          aria-label="Filter options"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {filters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CommonFilter;

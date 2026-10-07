"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import ROUTES from "@/constants/routes";
import { globalSearch } from "@/lib/actions/general.action";

import { Input } from "../ui/input";

const hrefFor = ({ type, id }: GlobalSearchResult) => {
  switch (type) {
    case "user":
      return ROUTES.PROFILE(id);
    case "tag":
      return ROUTES.TAGS(id);
    default:
      return ROUTES.QUESTION(id);
  }
};

const TYPES: { label: string; value: GlobalSearchParams["type"] }[] = [
  { label: "All", value: null },
  { label: "Questions", value: "question" },
  { label: "Answers", value: "answer" },
  { label: "Users", value: "user" },
  { label: "Tags", value: "tag" },
];

const GlobalSearch = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<GlobalSearchParams["type"]>(null);
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const response = await globalSearch({ query: trimmed, type });
      if (cancelled) return;

      setIsLoading(false);
      if (response.success) {
        setResults(response.data ?? []);
        setError(null);
      } else {
        setResults([]);
        setError(response.error?.message ?? "Search failed");
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, type]);

  const close = () => {
    setIsOpen(false);
    setQuery("");
    setType(null);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[600px] max-lg:hidden">
      <div className="background-light800_darkgradient relative flex min-h-[56px] grow items-center gap-1 rounded-xl px-4">
        <Image src="/icons/search.svg" alt="Search" width={24} height={24} />
        <Input
          type="text"
          placeholder="Search globally"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
        />
        {isLoading && <Loader2 className="size-4 animate-spin text-light-400" />}
      </div>

      {isOpen && query.trim() && (
        <div className="absolute top-full z-10 mt-3 w-full rounded-xl bg-light-800 py-5 shadow-sm dark:bg-dark-400">
          <div className="flex items-center gap-2 px-5">
            <p className="text-dark400_light900 body-medium">Type:</p>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setType(value)}
                  className={`small-medium rounded-2xl px-4 py-1.5 capitalize ${
                    type === value
                      ? "primary-gradient text-light-900"
                      : "bg-light-700 text-dark-400 dark:bg-dark-500 dark:text-light-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="my-5 h-px bg-light-700/50 dark:bg-dark-500/50" />

          <p className="text-dark400_light900 paragraph-semibold px-5">Top Match</p>

          <div className="mt-3 space-y-1">
            {isLoading && results.length === 0 ? (
              <div className="flex-center flex-col px-5 py-6">
                <Loader2 className="my-2 size-6 animate-spin text-primary-500" />
                <p className="text-dark200_light800 body-regular">Searching...</p>
              </div>
            ) : error ? (
              <p className="text-dark200_light800 body-regular px-5 py-6 text-center">{error}</p>
            ) : results.length === 0 ? (
              <p className="text-dark200_light800 body-regular px-5 py-6 text-center">
                Oops, no results found
              </p>
            ) : (
              results.map((item) => (
                <Link
                  key={`${item.type}-${item.id}-${item.title}`}
                  href={hrefFor(item)}
                  onClick={close}
                  className="flex w-full items-start gap-3 px-5 py-2.5 hover:bg-light-700/50 dark:hover:bg-dark-500/50"
                >
                  <Image src="/icons/tag.svg" alt={item.type} width={18} height={18} className="invert-colors mt-1 object-contain" />
                  <div className="flex flex-col">
                    <p className="body-medium text-dark200_light800 line-clamp-1">{item.title}</p>
                    <p className="text-light400_light500 small-medium mt-1 font-bold capitalize">{item.type}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;

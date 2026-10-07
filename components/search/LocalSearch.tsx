"use client"
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { Input } from '../ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { formUrlQuery, removeKeysFromUrlQuery } from '@/lib/url';
import { cn } from '@/lib/utils';

interface Props {
    imgSrc: string;
    placeholder: string;
    otherClasses?: string
}

const LocalSearch = ({ imgSrc,placeholder,otherClasses }: Props) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Navigation is debounced from the change handler (not an effect) so that URL
    // changes such as back/forward never trigger a stale push of the old input.
    const handleChange = (value: string) => {
        setSearchQuery(value);
        clearTimeout(timer.current);

        timer.current = setTimeout(() => {
            const params = searchParams.toString();
            const newUrl = value
                ? formUrlQuery({ params, key: "query", value, keysToRemove: ["page"] })
                : removeKeysFromUrlQuery({ params, keysToRemove: ["query", "page"] });

            router.push(newUrl, {scroll: false});
        }, 300);
    };

    useEffect(() => () => clearTimeout(timer.current), []);

    return (
        <div className={cn('background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4', otherClasses)}>
        <Image
            src={imgSrc}
            width={24}
            height={24}
            alt='Search'
        />
        <Input type='text' placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => handleChange(e.target.value)}
        className='paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none' />
        </div>
    );
};

export default LocalSearch;

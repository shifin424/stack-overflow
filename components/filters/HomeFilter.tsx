"use client"
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { homeFilters } from '@/constants/filters';
import { formUrlQuery, removeKeysFromUrlQuery } from '@/lib/url';

const HomeFilter = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const active = searchParams.get("filter") ?? "";

    const handleTypeClick = (filter: string) => {
        const params = searchParams.toString();
        const newUrl = filter === active
            ? removeKeysFromUrlQuery({ params, keysToRemove: ["filter", "page"] })
            : formUrlQuery({ params, key: "filter", value: filter, keysToRemove: ["page"] });

        router.push(newUrl, {scroll: false});
    };

    return (
<div className='mt-10 hidden flex-wrap gap-3 sm:flex'>
{
    homeFilters.map((filter) => (
        <Button key={filter.value} className={cn(`body-medium rounded-lg px-6 py-3 capitalize shadow-none`,
            active === filter.value
            ? "bg-primary-100 text-primary-500 hover:bg-primary-100 dark:bg-dark-400 dark:text-primary-500 dark:hover:bg-dark-400"
            : "bg-light-800 text-light-500 hover:bg-light-800 dark:bg-dark-300 dark:text-light-500 dark:hover:bg-dark-300"

        )} onClick={() => handleTypeClick(filter.value)} >
            {filter.name}
        </Button>
    ))
}

</div>
    );
};

export default HomeFilter;

import ROUTES from '@/constants/routes';
import Link from 'next/link';
import React from 'react';
import { Badge } from '../ui/badge';
import { getDeviconClassName } from '@/lib/utils';
import Image from 'next/image';

interface Props {
    _id: string;
    name: string;
    questions?: number;
    showCount?: boolean;
    compact?: boolean;
    remove?: boolean;
    isButton?: boolean;
    handleRemove?: () => void;
}

const TagCard = ({ _id,name,questions,showCount,compact,remove,isButton,handleRemove }: Props) => {
    const iconClass = getDeviconClassName(name);

    const Content = (
        <>
         <Badge className='subtle-medium background-light800_dark300 text-light400_light500 rounded-md border-none px-4 py-2 uppercase'>
                <div className='flex-center space-x-2'>
                    <i className={`${iconClass} text-sm`}></i>
                    <span>{name}</span>
                </div>

    {remove && (
        <button type='button' onClick={handleRemove} aria-label={`Remove ${name}`} className='flex-center'>
            <Image
                src="/icons/close.svg"
                width={12}
                height={12}
                alt=''
                className='object-contain invert-0 dark:invert'
            />
        </button>
    )}
    </Badge>

    { showCount && (
      <p className='small-medium text-dark500_light700'>{questions}</p>
          )}
        </>
    );

    const className = compact ? 'flex justify-between gap-2' : 'flex';

    return isButton ? (
        <div className={className}>{Content}</div>
    ) : (
        <Link href={ROUTES.TAGS(_id)} className={className}>
            {Content}
        </Link>
    );
};

export default TagCard;

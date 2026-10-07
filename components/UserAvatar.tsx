import Image from "next/image";
import Link from "next/link";

import ROUTES from "@/constants/routes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  name: string;
  imageUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
}

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const UserAvatar = ({ id, name, imageUrl, className = "size-9", fallbackClassName }: Props) => (
  <Link href={ROUTES.PROFILE(id)} aria-label={name}>
    <Avatar className={cn("relative", className)}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="96px"
          quality={100}
          className="rounded-full object-cover"
        />
      ) : (
        <AvatarFallback
          className={cn(
            "primary-gradient font-space-grotesk font-bold tracking-wider text-white",
            fallbackClassName
          )}
        >
          {initials(name)}
        </AvatarFallback>
      )}
    </Avatar>
  </Link>
);

export default UserAvatar;

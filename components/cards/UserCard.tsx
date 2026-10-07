import Link from "next/link";

import ROUTES from "@/constants/routes";
import { formatNumber } from "@/lib/utils";

import UserAvatar from "../UserAvatar";

const UserCard = ({ _id, name, username, image, reputation }: Pick<User, "_id" | "name" | "username" | "image" | "reputation">) => (
  <article className="xs:w-[230px] w-full shadow-light100_darknone">
    <div className="background-light900_dark200 light-border flex w-full flex-col items-center justify-center rounded-2xl border p-8">
      <UserAvatar id={_id} name={name} imageUrl={image} className="size-[100px] rounded-full object-cover" fallbackClassName="text-3xl tracking-widest" />

      <Link href={ROUTES.PROFILE(_id)} className="mt-4 text-center">
        <h3 className="h3-bold text-dark200_light900 line-clamp-1">{name}</h3>
        <p className="body-regular text-dark500_light500 mt-2">@{username}</p>
      </Link>

      <p className="small-semibold text-primary-500 mt-4">{formatNumber(reputation ?? 0)} reputation</p>
    </div>
  </article>
);

export default UserCard;

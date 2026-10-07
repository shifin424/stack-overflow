import Image from "next/image";
import Link from "next/link";

interface Props {
  imgUrl: string;
  href?: string;
  title: string;
}

const ProfileLink = ({ imgUrl, href, title }: Props) => (
  <div className="flex-center gap-1">
    <Image src={imgUrl} alt="" width={20} height={20} />
    {href ? (
      <Link href={href} target="_blank" rel="noopener noreferrer" className="paragraph-medium text-primary-500 underline">
        {title}
      </Link>
    ) : (
      <p className="paragraph-medium text-dark400_light700">{title}</p>
    )}
  </div>
);

export default ProfileLink;

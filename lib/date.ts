/** "Joined March 2025" style label for profile pages. */
const joinedLabel = (value: string | Date) =>
  `Joined ${new Date(value).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;

export default joinedLabel;

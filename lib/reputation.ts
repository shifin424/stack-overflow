/** Reputation points awarded for each action. Negative values subtract. */
export const REPUTATION = {
  QUESTION_ASKED: 5,
  ANSWER_POSTED: 10,
  UPVOTE_RECEIVED: 10,
  DOWNVOTE_RECEIVED: -2,
} as const;

export const BADGE_CRITERIA = {
  QUESTION_COUNT: { BRONZE: 10, SILVER: 50, GOLD: 100 },
  ANSWER_COUNT: { BRONZE: 10, SILVER: 50, GOLD: 100 },
  TOTAL_UPVOTES: { BRONZE: 10, SILVER: 50, GOLD: 100 },
  TOTAL_VIEWS: { BRONZE: 1000, SILVER: 10000, GOLD: 100000 },
} as const;

export const assignBadges = (counts: Record<keyof typeof BADGE_CRITERIA, number>): Badges => {
  const badges: Badges = { GOLD: 0, SILVER: 0, BRONZE: 0 };

  (Object.keys(BADGE_CRITERIA) as (keyof typeof BADGE_CRITERIA)[]).forEach((key) => {
    const levels = BADGE_CRITERIA[key];
    const value = counts[key];
    if (value >= levels.GOLD) badges.GOLD += 1;
    else if (value >= levels.SILVER) badges.SILVER += 1;
    else if (value >= levels.BRONZE) badges.BRONZE += 1;
  });

  return badges;
};

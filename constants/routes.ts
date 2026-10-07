const ROUTES = {
    HOME: "/",
    SIGN_IN: "/sign-in",
    SIGN_UP: "/sign-up",
    ASK_QUESTION: "/ask-question",
    COLLECTION: "/collection",
    COMMUNITY: "/community",
    JOBS: "/jobs",
    TAGS_LIST: "/tags",
    PROFILE: (id: string) => `/profile/${id}`,
    EDIT_PROFILE: "/profile/edit",
    TAGS: (id: string) => `/tags/${id}`,
    QUESTION: (id: string) => `/question/${id}`,
    EDIT_QUESTION: (id: string) => `/question/${id}/edit`,
}
export default ROUTES;

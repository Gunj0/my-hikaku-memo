const PATH = {
  HOME: "/",
  OGP: "/ogp.png",
  ICON: "/icon.svg",
  AUTH: {
    LOGIN: "/login",
    USER: "/user",
  },
  MEMO: {
    LIST: "/memo",
    NEW: "/memo/new",
    EDIT: "/memo/edit",
    DETAIL: "/memo/",
    USER: "/memo/user/",
  },
  NOT_FOUND: "/404",
  // API Route
  API: {
    MEMO: {
      LIST: "/api/memo/get-memos",
    },
    AI: {
      SUGGEST_POINTS: "/api/ai/suggest-points",
      SUGGEST_PRODUCTS: "/api/ai/suggest-products",
    },
  },
  // 外部API
  BACKEND: {
    MEMO: "/memo",
  },
};

export default PATH;

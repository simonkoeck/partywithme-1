export const API_BASE_URL =
  process.env.NODE_ENV == "development"
    ? "http://localhost:5000"
    : "https://api.party-with-me.com";

//@flow
let fetchF;
import mockAPI from "data/mock-api";

if (process.env.NODE_ENV === "test") {
  fetchF = mockAPI;
} else {
  const port = "5000";
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? `http://localhost:${port}`
      : `https://vault.ledger.com`;
  fetchF = (uri: string, options: Object): Promise<*> => {
    let prefix = location.pathname.split("/")[1];
    if (prefix !== "" && process.env.NODE_ENV !== "development") {
      prefix = "/gate/" + prefix;
    } else {
      prefix = "/" + prefix;
    }
    return fetch(baseUrl + prefix + uri, options);
  };
}
export default fetchF;

import { APP_ROOT } from "./constants";
import { RequestObject } from "./types";

export const request = async (
  authToken: string | undefined,
  method: string,
  url: string,
  data?: Record<string, unknown>,
  isAuthenticated = true
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  if (!authToken && isAuthenticated) {
    console.error("--- UNAUTHORISED ACCESS ---");
    return;
  }
  const requestObject: RequestObject = {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  if (isAuthenticated) {
    requestObject.headers.Authorization = `Bearer ${authToken}`;
  }
  if (method === "POST" && data) {
    requestObject.body = JSON.stringify(data);
  }
  const response = await fetch(`${APP_ROOT}${url}`, requestObject);
  return response.json();
};

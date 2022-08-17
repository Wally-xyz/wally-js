import { APP_ROOT } from "../constants";
import { VeriftOTPResult, Wallet } from "../types";

export const request = async (
  authToken: string | undefined,
  method: string,
  url: string,
  data?: Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<Wallet[] | VeriftOTPResult> => {
  if (!authToken) {
    console.error("--- UNAUTHORISED ACCESS ---");
  }
  const response = await fetch(`${APP_ROOT}${url}`, {
    method,
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  return response.json();
};

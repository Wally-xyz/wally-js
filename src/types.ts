export type RequestObject = {
  method: string;
  headers: {
    Authorization?: string;
    Accept: string;
    "Content-Type": string;
  };
  body?: string;
};

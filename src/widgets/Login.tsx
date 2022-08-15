import React from "react";

import { wrapper } from "./styles";

export const LoginComponent: React.FC<{
  setAuthToken: (authToken: string) => void;
}> = ({ setAuthToken }) => (
  <div style={wrapper}>
    <input placeholder="username" />
    <input placeholder="password" />
    <button
      onClick={() =>
        setAuthToken(
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NjhiMTllYS1lN2Q0LTQ0M2QtYmQzOS1mOGNiY2RhZDBhZWUiLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE2NjAzMTc1MjJ9.yFTqkLUVyVRnB54-5FCyB0XWo0Xtr6ORWksnizyzOrc"
        )
      }
    >
      Login
    </button>
  </div>
);

import { WallyConnector } from ".";

describe("wally-connector", () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
        // eslint-disable-next-line
      } as any)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getOTP", () => {
    const wallyConnector = new WallyConnector();
    wallyConnector.getOTP("test@test.com");
    expect(global.fetch).toBeCalledTimes(1);
  });
});

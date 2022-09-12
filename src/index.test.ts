import { WallyConnector } from ".";

describe("wally-connector", () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: Promise.resolve({ foo: "bar" }),
          }),
        // eslint-disable-next-line
      } as any)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getOTP", () => {
    const wallyConnector = new WallyConnector("DUMMY_CLIENT_ID");
    wallyConnector.getOTP("test@test.com");
    expect(global.fetch).toBeCalledTimes(1);
  });

  test("createWallet", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ address: "DUMMY_ADDRESS" }),
        // eslint-disable-next-line
      } as any)
    );

    const wallyConnector = new WallyConnector("DUMMY_CLIENT_ID");
    const result = await wallyConnector.createWallet({
      email: "test@test.com",
    });
    expect(global.fetch).toBeCalledTimes(1);
    expect(result.address).toEqual("DUMMY_ADDRESS");
  });
});

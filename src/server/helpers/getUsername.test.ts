import { getUsername } from "./getUsername.js";

describe("getUsername", () => {
  it("uses Auth user name when available", () => {
    const req = {};
    const auth = {
      getToken: vi.fn().mockReturnValue("token"),
      getUser: vi.fn().mockReturnValue({ name: "test\nuser" }),
    };

    expect(getUsername(req as never, auth as never)).toBe("test user");
  });

  it("falls back to request raw user when Auth user is unavailable", () => {
    const req = { raw: { user: { username: "fallback-user" } } };
    const auth = {
      getToken: vi.fn().mockReturnValue("token"),
      getUser: vi.fn().mockReturnValue(undefined),
    };

    expect(getUsername(req as never, auth as never)).toBe("fallback-user");
  });

  it("uses email when name and username are unavailable", () => {
    const req = {};
    const auth = {
      getToken: vi.fn().mockReturnValue("token"),
      getUser: vi.fn().mockReturnValue({ email: "user@example.com" }),
    };

    expect(getUsername(req as never, auth as never)).toBe("user@example.com");
  });

  it("returns Unknown User for an object with blank user fields", () => {
    const req = { raw: { user: { name: " ", username: " ", email: "" } } };
    const auth = {
      getToken: vi.fn().mockReturnValue("token"),
      getUser: vi.fn().mockReturnValue({ name: " " }),
    };

    expect(getUsername(req as never, auth as never)).toBe("Unknown User");
  });

  it("returns Unknown User when no user can be resolved", () => {
    const req = {};
    const auth = {};

    expect(getUsername(req as never, auth as never)).toBe("Unknown User");
  });
});

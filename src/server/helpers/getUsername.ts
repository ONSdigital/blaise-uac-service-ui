import { type Auth } from "blaise-login-react-server";
import { type Request } from "express";

type AuthLike = Partial<Pick<Auth, "getToken" | "getUser">>;

type NamedUser = {
  name?: unknown;
  username?: unknown;
  email?: unknown;
};

function sanitise(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function readName(value: unknown): string | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const user = value as NamedUser;

  if (typeof user.name === "string" && user.name.trim() !== "") {
    return user.name;
  }

  if (typeof user.username === "string" && user.username.trim() !== "") {
    return user.username;
  }

  if (typeof user.email === "string" && user.email.trim() !== "") {
    return user.email;
  }

  return undefined;
}

function getUserFromRequest(req: Request): unknown {
  const reqWithRaw = req as Request & { raw?: { user?: unknown } };

  return reqWithRaw.raw?.user;
}

export function getUsername(req: Request, auth: Auth): string {
  const authLike = auth as AuthLike;

  if (typeof authLike.getToken === "function" && typeof authLike.getUser === "function") {
    const authUser = authLike.getUser(authLike.getToken(req));
    const nameFromAuth = readName(authUser);

    if (nameFromAuth) {
      return sanitise(nameFromAuth);
    }
  }

  const nameFromRequest = readName(getUserFromRequest(req));

  if (nameFromRequest) {
    return sanitise(nameFromRequest);
  }

  return "Unknown User";
}

import { verifyToken } from "./tokens";
export function authorize(req: Request, allowedRoles: string[] = []) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer")) throw new Error("Unauthorized");
  const token = authHeader.split(" ")[1];
  const decoded: any = verifyToken(token);
  if (allowedRoles.length && !allowedRoles.includes(decoded.rule)) {
    throw new Error("Forbidden: Insufficient role permission");
  }
  return decoded;
  // return payload (id,email,role, etc.)
}

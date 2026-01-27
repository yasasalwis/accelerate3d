import { default as middleware } from "next-auth/middleware";

export default middleware;
export const proxy = middleware;

export const config = {
    matcher: [
        "/",
        "/printers/:path*",
        "/library/:path*",
        "/jobs/:path*",
        "/analytics/:path*",
    ],
};

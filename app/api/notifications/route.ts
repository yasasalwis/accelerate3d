import {NextResponse} from "next/server";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/lib/auth";
import {db} from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    try {
        const userId = (session.user as { id: string }).id;
        const notifications = await db.notification.findMany({
            where: {userId},
            orderBy: {createdAt: "desc"},
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return NextResponse.json({error: "Failed to fetch notifications"}, {status: 500});
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    try {
        const body = await request.json();
        const {title, message, type} = body;
        const userId = (session.user as { id: string }).id; // For now, we assume the user creates for themselves or we use this for system notifications for the current user

        const notification = await db.notification.create({
            data: {
                title,
                message,
                type: type || "INFO",
                userId,
            },
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error("Failed to create notification:", error);
        return NextResponse.json({error: "Failed to create notification"}, {status: 500});
    }
}

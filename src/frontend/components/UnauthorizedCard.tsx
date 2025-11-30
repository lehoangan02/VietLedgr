import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty"

export function UnauthorizedCard() {
    return (
        <Empty className="flex flex-col items-center justify-center py-16">
            <EmptyHeader className="flex flex-col items-center gap-2 text-center">
                <EmptyTitle className="text-2xl font-semibold">
                401 - Unauthorized
                </EmptyTitle>
            </EmptyHeader>

            <div className="my-4">
                <Image
                src="/padlock.png"
                width={100}
                height={100}
                alt="Locked padlock icon"
                />
            </div>

            <EmptyContent className="flex flex-col items-center gap-3 text-center max-w-md">
                <EmptyDescription className="text-lg">
                You may need to sign in with a different account or request access to
                this resource.
                </EmptyDescription>

                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Button asChild>
                    <Link href="/">Back to home</Link>
                </Button>
                </div>

                <EmptyDescription className="text-sm text-muted-foreground">
                Need help?{" "}
                <a
                    href="#"
                    className="font-medium underline underline-offset-4"
                >
                    Contact support
                </a>
                </EmptyDescription>
            </EmptyContent>
        </Empty>
    )
}

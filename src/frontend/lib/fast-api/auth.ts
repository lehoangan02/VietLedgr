export async function postLogin(requestBody: FormData) {
    const res = await fetch("/api/auth/login", {
        method: "POST",
        body: requestBody,
    });
    if(!res.ok) {
        throw new Error("Internal Server Error");
    }
    const data = await res.json() as {
        status: number;
        message: string;
    };
    if (data.status !== 200) {
        throw new Error(data.message ?? "Username or Password is wrong.");
    }

    return data;
}

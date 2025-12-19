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

export type SignupRequestBody = {
    username: string;
    password: string;
    invite_code: string;
};

export type SignupResponse = {
    access_token: string;
    token_type: string;
    user_id: string;
    username: string;
    role_id: string;
    role_name: string;
};

export async function postSignup(body: SignupRequestBody): Promise<SignupResponse> {
    const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const data = (await res.json().catch(() => null)) as
        | SignupResponse
        | { detail?: string }
        | null;

    if (!res.ok) {
        const message = (data as { detail?: string } | null)?.detail || "Registration failed";
        throw new Error(message);
    }

    return data as SignupResponse;
}

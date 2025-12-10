import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("http://localhost:5173/api/auth/login", async ({ request }) => {
    const body = await request.json();
    console.log("LOGIN MOCK BODY:", body); // debug

    if (body.email === "admin@gmail.com" && body.password === "123456") {
      return HttpResponse.json(
        {
          accessToken: "mock-access",
          refreshToken: "mock-refresh",
          user: {
            id: 1,
            email: body.email,
            name: "Admin",
          },
        },
        { status: 200 }
      );
    }

    return HttpResponse.json(
      { message: "Sai tài khoản hoặc mật khẩu" },
      { status: 401 }
    );
  }),

  http.post("http://localhost:5173/api/auth/refresh", async () => {
    return HttpResponse.json(
      { accessToken: "mock-access-updated" },
      { status: 200 }
    );
  }),
];

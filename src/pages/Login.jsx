// src/pages/Login.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { loginRequest } from "../api/authApi";
import { useAuth } from "../auth/authProvider";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const { login } = useAuth();
  const navigate = useNavigate();

  // 🔥 React Query v5 mutation chuẩn
  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await loginRequest(data);
      return res;
    },

    onSuccess: (data) => {
      login(data); // truyền full data (user, accessToken, refreshToken)
      sessionStorage.setItem("email", JSON.stringify(data));
      navigate("/dashboard");
    },
    onError: (err) => {
      setError("root", {
        message: err?.response?.data?.message || "Sai email hoặc mật khẩu",
      });
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4">
      <form
        className="w-full max-w-md bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-gray-100"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Đăng nhập
        </h2>

        {/* Email */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            {...register("email", { required: "Email bắt buộc" })}
            className="w-full border border-gray-300 p-3 rounded-lg
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                     transition"
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu
          </label>
          <input
            type="password"
            {...register("password", { required: "Mật khẩu bắt buộc" })}
            className="w-full border border-gray-300 p-3 rounded-lg
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                     transition"
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-medium
                   hover:bg-blue-700 active:scale-[0.98] transition disabled:opacity-70"
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        {/* Error */}
        {errors.root && (
          <p className="text-red-500 mt-4 text-center text-sm">
            {errors.root.message}
          </p>
        )}
      </form>
    </div>
  );
}

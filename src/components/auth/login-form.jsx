import React, { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import { getImageBaseUrl } from "@/utils/imageUtils";

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  emailInputRef,
  handleSubmit,
  isLoading,
  loadingMessage,
  onSwitchToForgot,
}) {
  const companyDetails = useSelector((state) => state.company.companyDetails);
  const companyImage = useSelector((state) => state.company.companyImage);

  const logoBaseUrl = getImageBaseUrl(companyImage, "Company");
  const logoUrl =
    logoBaseUrl && companyDetails?.company_logo
      ? `${logoBaseUrl}${companyDetails.company_logo}`
      : null;

  return (
    <div className="h-full lg:col-span-2 p-8 md:p-12 lg:p-16 flex flex-col justify-between bg-white text-zinc-950">
      {/* Brand Logo Header */}
      <div className="flex items-center gap-3">
        {logoUrl && (
          <img
            src={logoUrl}
            alt="AG Solutions Logo"
            className="h-14 w-auto object-contain"
          />
        )}

        <div className="flex flex-col leading-none">
          <div
            className="text-[28px] tracking-tight"
            style={{ fontFamily: "Roboto, sans-serif" }}
          >
            <span className="font-black">AG</span>
            <span className="font-normal">Solutions</span>
          </div>

          <div className="text-[12px] uppercase text-zinc-500 mt-1 tracking-wide">
            Single Click Solution
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto my-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight mb-1">
            Welcome back
          </h1>
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            Comfort Meets Design
          </p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mobile No Input with bottom line */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Mobile Number
            </label>
            <input
              ref={emailInputRef}
              type="tel"
              placeholder="Enter your mobile no."
              value={email}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // allow only digits
                if (value.length <= 10) setEmail(value);
              }}
              minLength={10}
              maxLength={10}
              className="w-full py-2 bg-transparent text-zinc-850 placeholder-zinc-300 border-b border-zinc-200 focus:border-zinc-950 focus:outline-none transition-colors text-sm font-medium"
            />
          </div>

          {/* Password Input with bottom line */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2 pr-10 bg-transparent text-zinc-850 placeholder-zinc-300 border-b border-zinc-200 focus:border-zinc-950 focus:outline-none transition-colors text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 bottom-2 text-zinc-400 hover:text-zinc-650 p-1 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onSwitchToForgot}
              className="text-xs font-semibold text-zinc-405 hover:text-zinc-950 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Solid Black Button */}
          <div className="pt-2">
            <Button
              className="w-full py-6 rounded-md bg-zinc-950 text-white hover:bg-zinc-800 transition-colors flex items-center justify-center font-bold text-xs tracking-wider uppercase cursor-pointer"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>{loadingMessage || "Signing In..."}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn size={14} />
                  <span>Sign In</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Footer Copy */}
      <div className="text-[10px] text-zinc-400 text-center mt-8">
        © AG solutions. All rights reserved.
      </div>
    </div>
  );
}

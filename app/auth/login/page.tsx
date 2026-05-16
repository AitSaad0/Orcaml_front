// app/auth/login/page.tsx
import { Suspense } from "react";
import Login from "@/components/auth/sections/login/login";

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
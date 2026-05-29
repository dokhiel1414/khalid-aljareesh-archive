import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "تسجيل الدخول" };

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] grid place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-ink text-gold grid place-items-center font-display font-bold text-2xl shadow-card">
            خ
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">
            لوحة التحكم
          </h1>
          <p className="text-sm text-ink/60 mt-1">
            سجّل الدخول لإدارة محتوى الأرشيف.
          </p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

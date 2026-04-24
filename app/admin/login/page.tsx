import { Shield } from "lucide-react";
import { AdminLoginForm } from "@/components/admin/login-form";
import { Card } from "@/components/ui/card";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-3xl bg-orange-100 text-orange-600">
          <Shield className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-500">Secure access for restaurant operators and managers.</p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </Card>
    </main>
  );
}

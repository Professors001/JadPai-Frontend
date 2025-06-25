"use client"

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// 1. Define the validation schema using Zod
const FormSchema = z.object({
  email: z.string().email({
    message: "รูปแบบอีเมลไม่ถูกต้อง",
  }),
  password: z.string().min(1, {
    message: "กรุณากรอกรหัสผ่าน",
  }),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // 2. Initialize the form with react-hook-form and Zod
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 3. Implement the onSubmit function to handle API calls
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const toastId = toast.loading("กำลังเข้าสู่ระบบ...");

    try {
      const response = await fetch('http://localhost:6969/users/auth', { // Replace with your actual login endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle the specific error message from your backend: {"error": "Invalid credentials."}
        throw new Error(result.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }

      // --- On Success ---
      
      // 4. Store user data from the successful response in localStorage
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
      }
      
      // Optional: Store the auth token if your API provides one
      if (result.token) {
        localStorage.setItem('token', result.token);
      }

      toast.success("เข้าสู่ระบบสำเร็จ!", {
        description: "กำลังนำคุณไปยังหน้าหลัก...",
        id: toastId,
      });

      // 5. Redirect to the main page after a short delay
      setTimeout(() => {
        window.location.href = '/events';
      }, 1000);

    } catch (error) {
      console.error("Login failed:", error);
      // 6. Show an error toast if authentication fails
      toast.error("เข้าสู่ระบบไม่สำเร็จ", {
        description: error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด",
        id: toastId,
      });
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-bold">JadPai</h1>
            <h1 className="text-xl">เข้าสู่ระบบ</h1>
            <div className="text-center text-sm">
              ยังไม่มีบัญชี?{" "}
              <a href="/signup" className="underline underline-offset-4">
                สมัครเลย!
              </a>
            </div>
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="กรอกที่อยู่อีเมลของคุณ"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>รหัสผ่าน</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="กรอกรหัสผ่านของคุณ"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </Button>

          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              หรือ
            </span>
          </div>

          <Button variant="outline" type="button" className="w-full flex items-center gap-2">
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            เข้าสู่ระบบด้วยบัญชี Google
          </Button>
        </form>
      </Form>
    </div>
  );
}

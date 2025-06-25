"use client"

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const FormSchema = z.object({
  name: z.string().min(1, {
    message: "ความยาวต้องมากกว่า 1 ตัวอักษร",
  }),
  surname: z.string().min(1, {
    message: "ความยาวต้องมากกว่า 1 ตัวอักษร",
  }),
  phone: z.string().min(10, {
    message: "เบอร์โทรศัพท์ไม่ถูกต้อง",
  }),
  email: z.string().email({
    message: "รูปแบบอีเมลไม่ถูกต้อง",
  }),
  password: z.string().min(6, { // A password should generally be longer
    message: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร",
  })
})

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      surname: "",
      phone: "",
      email: "",
      password: "",
    },
  })

  // Implement the async onSubmit function to handle the API call
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const toastId = toast.loading("กำลังสมัครสมาชิก...");

    try {
      const response = await fetch('http://localhost:6969/users', { // Replace with your actual signup endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json(); // Get the JSON response from the server

      if (!response.ok) {
        // If the server provides a specific error message, use it. Otherwise, use a generic one.
        throw new Error(result.message || 'Something went wrong. Please try again.');
      }

      // On success, show a success toast and redirect
      toast.success("สมัครสมาชิกเรียบร้อย!", {
        description: "กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...",
        id: toastId,
      });

      // Redirect to the login page after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);

    } catch (error) {
      console.error("Failed to sign up:", error);
      toast.error("ไม่สามารถสมัครสมาชิกได้", {
        // Display the error message from the server if available
        description: error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด",
        id: toastId,
      });
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-2xl font-bold">สมัครสมาชิก JadPai</h1>
              <div className="text-center text-sm">
                มีบัญชีอยู่แล้ว?{" "}
                <a href="/login" className="underline underline-offset-4">
                  กลับไปหน้าเข้าสู่ระบบ!
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-6">

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อ</FormLabel>
                    <FormControl>
                      <Input placeholder="กรอกชื่อของคุณ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>นามสกุล</FormLabel>
                    <FormControl>
                      <Input placeholder="กรอกนามสกุลของคุณ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เบอร์โทรศัพท์</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="กรอกเบอร์โทรศัพท์ของคุณ"
                        type="tel"
                        inputMode="numeric"
                        {...field}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/[^0-9]/g, '');
                          field.onChange(numericValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>อีเมล</FormLabel>
                    <FormControl>
                      <Input placeholder="กรอกอีเมลของคุณ" type="email" {...field} />
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
                      <Input placeholder="กรอกรหัสผ่านของคุณ" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

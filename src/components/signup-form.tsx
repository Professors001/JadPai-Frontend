"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
  password: z.string().min(1, {
    message: "ความยาวต้องมากกว่า 1 ตัวอักษร",
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

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data)
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
                          // Remove any non-numeric characters
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

              <Button type="submit" className="w-full">
                สมัครสมาชิก
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { User } from "@/interfaces/User";

// Define constants for file validation
const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const FormSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ"),
  phone: z.string().min(10, "เบอร์โทรศัพท์ต้องมีอย่างน้อย 10 หลัก"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  picture: z
    .any()
    .refine((files) => files?.length >= 1, "กรุณาเลือกไฟล์.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `ไฟล์ต้องมีขนาดไม่เกิน 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "รองรับเฉพาะไฟล์ .jpg, .jpeg, .png และ .webp."
    ),
});

interface EnrollFormProps {
  eventId: string;
}

export function EnrollForm({ eventId }: EnrollFormProps) {
  // 2. Add state for dialog control and to store the current user
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    // Default values will be populated by useEffect later
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      picture: undefined,
    },
  });

  // 3. Use useEffect to read user data from localStorage when the component mounts
  useEffect(() => {
    const storedUserJson = localStorage.getItem('user');
    if (storedUserJson) {
      try {
        const user: User = JSON.parse(storedUserJson);
        setCurrentUser(user);

        // 4. Pre-fill the form with the user's data
        form.reset({
          name: `${user.name} ${user.surname}`,
          phone: user.phone,
          email: user.email,
        });
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
      }
    }
  }, [form]); // Rerun if the form instance changes

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    // 5. Ensure we have user data before submitting
    if (!currentUser) {
      toast.error("ไม่พบข้อมูลผู้ใช้", { description: "กรุณาลองเข้าสู่ระบบใหม่อีกครั้ง" });
      return;
    }

    const toastId = toast.loading("กำลังส่งข้อมูลการสมัคร...");

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("phone", data.phone);
    formData.append("email", data.email);
    formData.append("picture", data.picture[0]);
    
    // 6. Use the user ID from the state
    formData.append("userId", String(currentUser.id)); 
    formData.append("eventId", eventId);

    try {
        const response = await fetch("http://localhost:6969/enrollments/enroll", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "การสมัครล้มเหลว");
        }

        toast.success("สมัครเข้าร่วมกิจกรรมสำเร็จ!", { id: toastId });
        setIsOpen(false); // Close dialog on success
        // Optionally reset the picture field manually if needed
        form.reset({ ...form.getValues(), picture: undefined });


    } catch (error) {
        console.error("Form submission failed:", error);
        toast.error("การสมัครล้มเหลว", {
            description: error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด",
            id: toastId,
        });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="py-6 w-full">เข้าร่วมกิจกรรม</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>ลงทะเบียนเข้าร่วม</DialogTitle>
              <DialogDescription>ข้อมูลของคุณจะถูกกรอกโดยอัตโนมัติ</DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อ-นามสกุล</FormLabel>
                  <FormControl>
                    <Input placeholder="กรอกชื่อของคุณ" {...field} />
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
                    <Input placeholder="กรอกเบอร์โทรศัพท์ของคุณ" type="tel" {...field} />
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
              name="picture"
              render={() => (
                <FormItem>
                  <FormLabel>รูปหลักฐานการชำระเงิน (ถ้ามี)</FormLabel>
                  <FormControl>
                    <Input type="file" {...form.register("picture")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "กำลังส่งข้อมูล..." : "ยืนยันการสมัคร"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

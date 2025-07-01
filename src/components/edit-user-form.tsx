"use client"

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode"; // ✨ 1. Import jwt-decode

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
import { DropdownMenuItem } from "./ui/dropdown-menu"; // For better UI integration
import { User as UserIcon } from "lucide-react";


const EditFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  surname: z.string().min(1, "Surname is required."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  password: z.string().optional(),
});

export function EditProfileForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserLoginData | null>(null);

  const form = useForm<z.infer<typeof EditFormSchema>>({
    resolver: zodResolver(EditFormSchema),
    defaultValues: {
      name: "",
      surname: "",
      phone: "",
      password: "",
    },
  });

  // ✨ 2. This useEffect is modified to read from sessionStorage and decode the JWT
  useEffect(() => {
    if (isOpen) {
      const token = sessionStorage.getItem('token');
      if (token) {
        try {
          const userData: UserLoginData = jwtDecode(token);
          setCurrentUser(userData);
          // Pre-fill the form with data from the token
          form.reset({
            name: userData.name,
            surname: userData.surname,
            phone: userData.phone,
            password: ""
          });
        } catch (error) {
          console.error("Failed to decode token", error);
        }
      }
    }
  }, [isOpen, form]);

  // ✨ 3. This onSubmit function is updated to send an authorized request
  async function onSubmit(data: z.infer<typeof EditFormSchema>) {
    const token = sessionStorage.getItem('token');
    if (!currentUser || !token) {
      toast.error("User not found. Please log in again.");
      return;
    }

    const toastId = toast.loading("Updating profile...");

    const changedData: Partial<z.infer<typeof EditFormSchema>> = {};
    if (data.name !== currentUser.name) changedData.name = data.name;
    if (data.surname !== currentUser.surname) changedData.surname = data.surname;
    if (data.phone !== currentUser.phone) changedData.phone = data.phone;
    if (data.password && data.password.length > 0) changedData.password = data.password;

    if (Object.keys(changedData).length === 0) {
        toast.info("No changes were made.", { id: toastId });
        setIsOpen(false);
        return;
    }

    try {
      const response = await fetch(`http://localhost:6969/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            // Add the Authorization header to authenticate the request
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(changedData),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || "Failed to update profile.");
      }

      const updateResult = await response.json(); // Expects { message, token }

      // ✨ 4. Update sessionStorage with the new token from the API
      if (updateResult.token) {
        sessionStorage.setItem('token', updateResult.token);
      }

      toast.success("Profile updated successfully!", { id: toastId });
      setIsOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Update failed", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        id: toastId,
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {/* ✨ 5. Changed to a DropdownMenuItem for better UI consistency in your Navbar */}
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>แก้ไขข้อมูลส่วนตัว</span>
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>แก้ไขข้อมูลส่วนตัว</DialogTitle>
              <DialogDescription>
                ทำการเปลี่ยนแปลงข้อมูลของคุณที่นี่ คลิกบันทึกเมื่อคุณทำเสร็จแล้ว
              </DialogDescription>
            </DialogHeader>

            {/* The rest of the form fields remain the same */}
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
                    <FormLabel>รหัสผ่านใหม่ (ไม่บังคับ)</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="กรอกรหัสผ่านใหม่" {...field} />
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
                {form.formState.isSubmitting ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
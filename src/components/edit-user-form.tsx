"use client"

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { User as UserIcon } from "lucide-react"; // Assuming you have a User interface
import { User } from "@/interfaces/User";

// Define a Zod schema for the edit form.
// All fields are optional except the ones you want to be mandatory for editing.
const EditFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  surname: z.string().min(1, "Surname is required."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  password: z.string().optional(), // Password is not required
});

export function EditProfileForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const form = useForm<z.infer<typeof EditFormSchema>>({
    resolver: zodResolver(EditFormSchema),
    defaultValues: {
      name: "",
      surname: "",
      phone: "",
      password: "",
    },
  });

  // Fetch user data from localStorage when the dialog is opened
  useEffect(() => {
    if (isOpen) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData: User = JSON.parse(storedUser);
          setCurrentUser(userData);
          // Pre-fill the form with existing data
          form.reset({
            name: userData.name,
            surname: userData.surname,
            phone: userData.phone,
            password: "" // Keep password field empty for security
          });
        } catch (error) {
          console.error("Failed to parse user data", error);
        }
      }
    }
  }, [isOpen, form]);

  async function onSubmit(data: z.infer<typeof EditFormSchema>) {
    if (!currentUser) {
      toast.error("User not found. Please log in again.");
      return;
    }

    const toastId = toast.loading("Updating profile...");

    // Prepare only the data that has changed
    const changedData: Partial<z.infer<typeof EditFormSchema>> = {};
    if (data.name !== currentUser.name) changedData.name = data.name;
    if (data.surname !== currentUser.surname) changedData.surname = data.surname;
    if (data.phone !== currentUser.phone) changedData.phone = data.phone;
    if (data.password) changedData.password = data.password;

    if (Object.keys(changedData).length === 0) {
        toast.info("No changes were made.", { id: toastId });
        setIsOpen(false);
        return;
    }

    try {
        console.log(changedData);
        
      const response = await fetch(`http://localhost:6969/users/${currentUser.id}`, {
        method: 'PUT', // PATCH is ideal for partial updates
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changedData),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || "Failed to update profile.");
      }

      const updatedUser = await response.json();

      // Update localStorage with the new user data
      localStorage.setItem('user', JSON.stringify(updatedUser.user));

      toast.success("Profile updated successfully!", { id: toastId });
      setIsOpen(false); // Close the dialog
      // Optionally, refresh the page to reflect changes everywhere
      setTimeout(() => {
        window.location.reload();
      }, 1500);

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
        {/* This button can be placed anywhere, like in a user dropdown menu */}
        <Button variant="outline">
            <UserIcon className="mr-2 h-4 w-full" />
            แก้ไขข้อมูลส่วนตัว
        </Button>
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

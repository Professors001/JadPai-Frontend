import React, { useState } from "react";
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "./ui/textarea";

// The Zod schema remains the same.
const FormSchema = z.object({
  name: z.string().min(1, {
    message: "ความยาวต้องมากกว่า 1 ตัวอักษร",
  }),
  max_cap: z.coerce.number().min(2, {
    message: "กิจกรรมต้องมีผู้เข้าร่วมอย่างน้อย 2 คน",
  }),
  description: z.string().optional(),
});

export function CreateEventForm() {
  // 1. Add state to control the Dialog's open/closed status
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      max_cap: 2,
      description: "",
    },
  });

  // 2. Implement the async onSubmit function to handle the API call
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const toastId = toast.loading("กำลังสร้างกิจกรรม...");

    try {
      const response = await fetch('http://localhost:6969/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // If the server responds with an error, handle it here
        throw new Error('Something went wrong. Please try again.');
      }

      // If the request is successful:
      toast.success("สร้างกิจกรรมเรียบร้อยแล้ว!", { id: toastId });
      
      form.reset(); // Reset form fields to default values
      setIsOpen(false); // Programmatically close the dialog

      // Optional: You might want to trigger a refresh of your events list here
      // For example: revalidatePath('/events'); or queryClient.invalidateQueries(...)

    } catch (error) {
      console.error("Failed to create event:", error);
      toast.error("ไม่สามารถสร้างกิจกรรมได้", {
        description: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์",
        id: toastId,
      });
    }
  }

  return (
    // 3. Control the Dialog component with the new state
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="py-10 w-full">+ สร้างกิจกรรม</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>สร้างกิจกรรมใหม่</DialogTitle>
              <DialogDescription>กรุณากรอกข้อมูลของกิจกรรมใหม่</DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อกิจกรรม</FormLabel>
                  <FormControl>
                    <Input placeholder="กรอกชื่อกิจกรรม" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_cap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>จำนวนผู้เข้าร่วมสูงสุด</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="กรอกจำนวนผู้เข้าร่วม"
                      {...field}
                      // Ensure value is a number for react-hook-form
                      onChange={event => field.onChange(+event.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รายละเอียด</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="บอกเล่ารายละเอียดเกี่ยวกับกิจกรรมของคุณ"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              {/* This button just closes the dialog without submitting */}
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                ยกเลิก
              </Button>
              {/* The submit button is disabled automatically while the form is submitting */}
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

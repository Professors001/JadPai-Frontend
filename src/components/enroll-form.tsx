import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  eventId: string; // The component now requires a numerical event ID
}

export function EnrollForm({ eventId }: EnrollFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });

  // --- MODIFIED onSubmit FUNCTION ---
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    // You must have the user's ID available in your component's state or props.
    // For this example, let's assume it's stored in a variable.
    const currentUserId = 1; // <-- Example: This ID must come from somewhere

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("phone", data.phone);
    formData.append("email", data.email);
    formData.append("picture", data.picture[0]);
    
    // --- CHANGE: Add the userId to the form data ---
    formData.append("userId", String(currentUserId)); 
    formData.append("eventId", eventId); // The ID of the event being enrolled in

    try {
        // The API call no longer needs the Authorization header
        const response = await fetch("http://localhost:6969/enrollments/enroll", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const result = await response.json();
        console.log("Form submitted successfully:", result);

    } catch (error) {
        console.error("Form submission failed:", error);
    }
}

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="py-6 w-full">เข้าร่วมกิจกรรม</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>ลงทะเบียนเข้าร่วม</DialogTitle>
              <DialogDescription>กรุณากรอกข้อมูลของคุณเพื่อลงทะเบียน</DialogDescription>
            </DialogHeader>

            {/* --- Form fields remain the same --- */}
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
            {/* ... other fields ... */}
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
                  <FormLabel>รูปหลักฐาน</FormLabel>
                  <FormControl>
                    <Input type="file" {...form.register("picture")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
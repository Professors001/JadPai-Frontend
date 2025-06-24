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
import { Label } from "@/components/ui/label";

// --- Helper function to simulate a file upload ---
const uploadFile = (file: File): Promise<{ filePath: string }> => {

    // make it keep on frontend side public directory

  console.log(`Uploading file: ${file.name}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockPath = `/uploads/images/${Date.now()}-${file.name}`;
      console.log(`File uploaded successfully. Path: ${mockPath}`);
      resolve({ filePath: mockPath });
    }, 1500);
  });
};

// Define constants for file validation
const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// --- FIXED ZOD SCHEMA ---
// This schema is now "isomorphic" - it works on both server and client.
const FormSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ"),
  phone: z.string().min(10, "เบอร์โทรศัพท์ต้องมีอย่างน้อย 10 หลัก"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  picture: z
    .any() // Use z.any() to avoid referencing browser-only `FileList` on the server
    .refine((files) => files?.length >= 1, "กรุณาเลือกไฟล์.") // Check that files exist
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `ไฟล์ต้องมีขนาดไม่เกิน 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "รองรับเฉพาะไฟล์ .jpg, .jpeg, .png และ .webp."
    ),
});

export function EnrollForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const file = data.picture[0];

    try {
      const uploadResult = await uploadFile(file);
      const imageUrl = uploadResult.filePath;

      const finalFormData = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        imageUrl: imageUrl,
      };

      console.log("Form submitted successfully with image path:", finalFormData);
    } catch (error) {
      console.error("File upload failed:", error);
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
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
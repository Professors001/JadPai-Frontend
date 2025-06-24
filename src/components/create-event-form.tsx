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
import { Textarea } from "./ui/textarea";

const FormSchema = z.object({
  name: z.string().min(1, {
    message: "ความยาวต้องมากกว่า 1 ตัวอักษร",
  }),
  max_cap: z.coerce.number().min(2, { // Use z.coerce.number() to automatically convert string from input to number
      message: "กิจกรรมต้องมีผู้เข้าร่วมมากกว่า 2",
  }),
  description: z.string().optional(), // Use optional() for fields that can be empty
});

export function CreateEventForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      max_cap: 2, // It's better to set a valid default
      description: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log("Form submitted successfully:", data);
    // Here you would typically close the dialog programmatically after a successful submission
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="py-10 w-full">+ สร้างกิจกรรม</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          {/* The form tag now wraps the content and the submit button */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>สร้างกิจกรรมใหม่</DialogTitle>
              <DialogDescription>กรุณากรอกข้อมูลของกิจกรรมใหม่</DialogDescription>
            </DialogHeader>

            {/* No need for an extra div, you can apply gap/space directly to the form */}
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
                    {/* The value needs to be handled carefully with type="number" */}
                    <Input
                      type="number"
                      placeholder="กรอกจำนวนผู้เข้าร่วม"
                      {...field}
                      onChange={event => field.onChange(event.target.valueAsNumber)}
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
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              {/* This button is now correctly inside the form */}
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
'use client'

import React, { useEffect, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { EventDtos } from '@/dtos/EventDtos';

// --- Zod Schema for Form Validation ---
const FormSchema = z.object({
  name: z.string().min(1, {
    message: "ความยาวต้องมากกว่า 1 ตัวอักษร",
  }),
  max_cap: z.coerce.number().min(2, {
      message: "กิจกรรมต้องมีผู้เข้าร่วมมากกว่า 2",
  }),
  description: z.string().optional(),
});


// --- Edit Event Form Component ---
export function EditEventForm({ event }: { event: EventDtos }) {
  // State to control the dialog's open/closed status
  const [isOpen, setIsOpen] = useState(false);
  
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: event.name || "",
      max_cap: event.max_cap || 2,
      description: event.description || "",
    },
  });

  // --- Implemented onSubmit function with API call ---
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const toastId = toast.loading("กำลังอัปเดตกิจกรรม...");

    // To be efficient, find what data actually changed and send only that
    const changedData: Partial<z.infer<typeof FormSchema>> = {};
    if (data.name !== event.name) changedData.name = data.name;
    if (data.max_cap !== event.max_cap) changedData.max_cap = data.max_cap;
    if (data.description !== event.description) changedData.description = data.description;

    // If no data has changed, inform the user and close the dialog
    if (Object.keys(changedData).length === 0) {
        toast.info("ไม่มีข้อมูลที่เปลี่ยนแปลง", { id: toastId });
        setIsOpen(false);
        return;
    }

    try {
        const response = await fetch(`http://localhost:6969/events/${event.id}`, {
            method: 'PUT', // PATCH is best for partial updates
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(changedData),
        });

        if (!response.ok) {
            const errorResult = await response.json();
            throw new Error(errorResult.message || "Failed to update event.");
        }

        toast.success("อัปเดตกิจกรรมเรียบร้อยแล้ว!", { id: toastId });
        setIsOpen(false);

        // Reload the page to see the changes. A more advanced app might use state management.
        setTimeout(() => {
          window.location.reload();
        }, 1500);

    } catch (error) {
        console.error("Failed to update event:", error);
        toast.error("การอัปเดตล้มเหลว", {
            description: error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
            id: toastId,
        });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="py-6 w-full">แก้ไขข้อมูลกิจกรรม</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>แก้ไขกิจกรรม</DialogTitle>
              <DialogDescription>อัปเดตข้อมูลสำหรับกิจกรรมของคุณ</DialogDescription>
            </DialogHeader>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อกิจกรรม</FormLabel>
                  <FormControl><Input placeholder="กรอกชื่อกิจกรรม" {...field} /></FormControl>
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
                    <Textarea placeholder="บอกเล่ารายละเอียดเกี่ยวกับกิจกรรมของคุณ" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>ยกเลิก</Button>
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

// --- Re-usable OwnerEventCard Component ---
interface OwnerEventCardProps {
  event: EventDtos;
  currentParticipants?: number;
  isDetailPage?: boolean;
}

function OwnerEventCard({ 
  event, 
  currentParticipants = 0, 
  isDetailPage = false,
}: OwnerEventCardProps) {
  const isFullCapacity = currentParticipants >= event.max_cap;
  const capacityPercentage = event.max_cap > 0 ? (currentParticipants / event.max_cap) * 100 : 0;

  return (
    <Card className="w-full max-w-5xl hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-semibold line-clamp-2 pr-2">{event.name}</CardTitle>
          <Badge variant={isFullCapacity ? "destructive" : "secondary"} className="shrink-0">
            {isFullCapacity ? "เต็ม" : "เปิดรับ"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className={`text-sm text-muted-foreground ${!isDetailPage ? 'line-clamp-3' : ''}`}>
          {event.description}
        </CardDescription>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">ผู้เข้าร่วม</span></div>
            <span className="font-medium">{currentParticipants}/{event.max_cap} คน</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div className={`h-2 rounded-full transition-all duration-300 ${capacityPercentage >= 90 ? 'bg-destructive' : capacityPercentage >= 70 ? 'bg-yellow-500' : 'bg-primary'}`} style={{ width: `${Math.min(capacityPercentage, 100)}%` }} />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">รหัสกิจกรรม: {event.id}</div>
      </CardContent>
      <CardFooter>
        {isDetailPage ? <EditEventForm event={event} /> : <a href={`/events/${event.id}`} className="w-full"><Button className="w-full py-6">ดูข้อมูล</Button></a>}
      </CardFooter>
    </Card>
  );
}

// --- Main Page Component ---
export default function EventDetailPage({ params }: { params: { id: string } }) {
    const [event, setEvent] = useState<EventDtos | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchEventData() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`http://localhost:6969/events/${params.id}`);
                if (!res.ok) throw new Error(`Failed to fetch event. Status: ${res.status}`);
                const data: EventDtos = await res.json();
                setEvent(data);
            } catch (err: any) {
                console.error("Error fetching event:", err);
                setError(err.message || "An unknown error occurred");
            } finally {
                setLoading(false);
            }
        }
        
        if (params.id) fetchEventData();
        else { setLoading(false); setError("No event ID provided."); }
    }, [params.id]);

    if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-xl">Loading event details...</p></div>;
    if (error) return <div className="flex items-center justify-center min-h-screen"><p className="text-xl text-red-500">Error: {error}</p></div>;
    if (!event) return <div className="flex items-center justify-center min-h-screen"><p className="text-xl">Event with ID '{params.id}' not found.</p></div>;

    return (
        <div className="flex flex-col items-center pt-16 px-4">
            <div className="w-full max-w-5xl space-y-4">
                <header>
                    <h1 className="text-3xl font-bold">Event Detail Page</h1>
                    <p className="text-muted-foreground">Event ID: {params.id}</p>
                </header>
                <OwnerEventCard
                    key={event.id}
                    event={event}
                    currentParticipants={event.confirmed_count} // Using real data
                    isDetailPage={true}
                />
            </div>
        </div>
    );
}

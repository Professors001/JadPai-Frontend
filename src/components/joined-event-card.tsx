import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { toast } from 'sonner';
import { EnrollmentWithEvent } from '@/dtos/EnrollmentDtos';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// The props now expect the enrollment object and an onCancel handler function
interface JoinedEventCardProps {
  enrollment: EnrollmentWithEvent;
}

export function JoinedEventCard({ 
  enrollment,
}: JoinedEventCardProps) {
  // Add a local loading state to disable the button during the API call
  const [isCancelling, setIsCancelling] = useState(false);
  
  const { event, status } = enrollment;
  const currentParticipants = event.confirmed_count;

  const isFullCapacity = currentParticipants >= event.max_cap;
  const capacityPercentage = (currentParticipants / event.max_cap) * 100;

  const getStatusLabel = (status: typeof enrollment.status) => {
    switch (status) {
      case 'confirmed': return 'อนุมัติ';
      case 'rejected': return 'ปฏิเสธ';
      case 'pending': return 'รอดำเนินการ';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  // --- NEW: Helper function to get styling for the status badge ---
  const getStatusBadgeClasses = (status: typeof enrollment.status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
    }
  };

  // The handler function now contains the full API logic
  const handleCancelClick = async () => {
    setIsCancelling(true);
    const toastId = toast.loading("กำลังยกเลิกการลงทะเบียน...");
    
    try {
        const res = await fetch(`http://localhost:6969/enrollments/${enrollment.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'cancelled' })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to cancel enrollment.");
        }

        toast.success("ยกเลิกการลงทะเบียนเรียบร้อยแล้ว", { id: toastId });

    } catch (error) {
        console.error("Error cancelling enrollment:", error);
        toast.error("เกิดข้อผิดพลาด", {
            description: error instanceof Error ? error.message : "ไม่สามารถยกเลิกการลงทะเบียนได้",
            id: toastId,
        });
    } finally {
      // It's good practice to reset the loading state in case of an error
      setIsCancelling(false);
    }
  };

  return (
    <Card className="w-full max-w-5xl hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-semibold line-clamp-2 pr-2">
            {event.name}
          </CardTitle>
          <Badge variant={isFullCapacity ? "destructive" : "secondary"} className="shrink-0">
            {isFullCapacity ? "เต็ม" : "เปิดรับ"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-sm text-muted-foreground line-clamp-3">
          {event.description}
        </CardDescription>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">ผู้เข้าร่วม</span>
            </div>
            <span className="font-medium">
              {currentParticipants}/{event.max_cap} คน
            </span>
          </div>
          
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                capacityPercentage >= 90 ? 'bg-destructive' : capacityPercentage >= 70 ? 'bg-yellow-500' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          รหัสกิจกรรม: {event.id}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2">
        <div className='flex flex-rows items-center justify-center gap-2'>
            <p className='text-muted-foreground text-sm'>สถานะการจอง:</p>
            <Badge className={`${getStatusBadgeClasses(status)} px-5 py-2 text-md`}>
              {getStatusLabel(status)}
            </Badge>
        </div>
        
        {(status === 'pending' || status === 'confirmed') && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive"
                  disabled={isCancelling}
                >
                  ยกเลิก
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
                  <AlertDialogDescription>
                    การกระทำนี้ไม่สามารถย้อนกลับได้ การลงทะเบียนของคุณจะถูกยกเลิกอย่างถาวร
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ปิด</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleCancelClick}
                    disabled={isCancelling}
                  >
                    {isCancelling ? "กำลังยกเลิก..." : "ยืนยันการยกเลิก"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
}

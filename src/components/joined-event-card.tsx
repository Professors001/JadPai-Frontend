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
import { Loader2, Ticket, Users } from 'lucide-react';
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

import { jsPDF } from 'jspdf';


// The props now expect the enrollment object and an onCancel handler function
interface JoinedEventCardProps {
  enrollment: EnrollmentWithEvent;
}

export const generateEnrollmentPDF = (enrollment: EnrollmentWithEvent) => {
  const doc = new jsPDF();
  
  // Set up colors (RGB values)
  const primaryColor: [number, number, number] = [45, 55, 72]; // #2d3748
  const secondaryColor: [number, number, number] = [113, 128, 150]; // #718096
  const accentColor: [number, number, number] = [102, 126, 234]; // #667eea
  const successColor: [number, number, number] = [34, 197, 94]; // #22c55e

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  // Header with decorative elements
  doc.setFillColor(...accentColor);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  // Main title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('bold');
  doc.text('Confirmed Ticket', centerX, 20, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(12);
  doc.setFont('normal');
  doc.text('Event Registration Confirmation', centerX, 26, { align: 'center' });

  let yPos = 50;

  // Status badge styling
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { text: 'Confirmed', color: [34, 197, 94] as [number, number, number], bgColor: [220, 252, 231] as [number, number, number] };
      case 'pending':
        return { text: 'Pending', color: [234, 179, 8] as [number, number, number], bgColor: [254, 249, 195] as [number, number, number] };
      case 'rejected':
        return { text: 'Rejected', color: [239, 68, 68] as [number, number, number], bgColor: [254, 226, 226] as [number, number, number] };
      case 'cancelled':
        return { text: 'Cancelled', color: [107, 114, 128] as [number, number, number], bgColor: [243, 244, 246] as [number, number, number] };
      default:
        return { text: status, color: [107, 114, 128] as [number, number, number], bgColor: [243, 244, 246] as [number, number, number] };
    }
  };

  const statusInfo = getStatusInfo(enrollment.status);
  
  // Status badge
  doc.setFillColor(...statusInfo.bgColor);
  doc.roundedRect(centerX - 25, yPos - 8, 50, 16, 8, 8, 'F');
  doc.setTextColor(...statusInfo.color);
  doc.setFontSize(14);
  doc.setFont('bold');
  doc.text(statusInfo.text, centerX, yPos, { align: 'center' });

  yPos += 30;

  // Event Information Section
  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('bold');
  doc.text('Event Information', 20, yPos);
  yPos += 5;

  // Line under section header
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 15;

  // Event details
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  
  const eventDetails = [
    ['Name:', String(enrollment.event.name || 'None.')],
    ['Event ID:', String(enrollment.event.id || 'None.')],
    ['Detail:', String(enrollment.event.description || 'No Detail.')],
    ['Participants:', `${enrollment.event.confirmed_count || 0}/${enrollment.event.max_cap || 0} Participants`],
  ];

  eventDetails.forEach(([label, value]) => {
    doc.setFont('bold');
    doc.text(String(label), 25, yPos);
    doc.setFont('normal');
    
    // Handle long text by splitting it into multiple lines
    const splitText = doc.splitTextToSize(String(value), 120);
    doc.text(splitText, 70, yPos);
    yPos += splitText.length * 6;
  });

  yPos += 20;

  // Participant Information Section
  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('bold');
  doc.text('Enrollment Information', 20, yPos);
  yPos += 5;

  // Line under section header
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 15;

  // Participant details
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  
  const participantDetails = [
    ['Enrollment ID:', String(enrollment.id || 'None.')],
    ['Name:', String(enrollment.name || 'None.')],
    ['Email:', String(enrollment.email || 'None.')],
    ['Phone:', String(enrollment.phone || 'None.')],
    ['Enrollment Date:', enrollment.enroll_date ? new Date(enrollment.enroll_date).toLocaleDateString('th-TH') : 'None.'],
    ['Last Updated:', enrollment.update_timestamp ? new Date(enrollment.update_timestamp).toLocaleDateString('th-TH') : 'None.']
  ];

  participantDetails.forEach(([label, value]) => {
    doc.setFont('bold');
    doc.text(String(label), 25, yPos);
    doc.setFont('normal');
    doc.text(String(value), 70, yPos);
    yPos += 8;
  });

  // QR Code placeholder (you can integrate a QR code library if needed)
  yPos += 20;
  doc.setDrawColor(...secondaryColor);
  doc.setLineWidth(1);
  doc.rect(centerX - 25, yPos, 50, 50);
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(8);
  doc.text('QR CODE', centerX, yPos + 27, { align: 'center' });
  doc.text(`ID: ${String(enrollment.id).substring(0, 8)}`, centerX, yPos + 33, { align: 'center' });

  // Footer
  yPos = 270;
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(8);
  doc.text('This Document is auto-generated.', centerX, yPos, { align: 'center' });
  doc.text(`Generated at: ${new Date().toLocaleString('th-TH')}`, centerX, yPos + 5, { align: 'center' });
  
  // Decorative footer line
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.5);
  doc.line(20, yPos + 10, 190, yPos + 10);

  return doc;
};

export const handleDownloadTicket = async (
  enrollment: EnrollmentWithEvent,
  setIsDownloading: (loading: boolean) => void,
  toast: any
) => {
  setIsDownloading(true);
  const toastId = toast.loading("กำลังสร้างบัตร PDF...");

  try {
    // Option 1: Generate PDF directly from existing data
    const doc = generateEnrollmentPDF(enrollment);
    const filename = `ticket-${enrollment.event.name.replace(/\s+/g, '-')}-${enrollment.id}.pdf`;
    doc.save(filename);
    
    toast.success("ดาวน์โหลดบัตรเรียบร้อยแล้ว", { id: toastId });

    // Option 2: If you need fresh data from API, uncomment below:
    /*
    // Fetch fresh enrollment data
    const response = await fetch(`http://localhost:6969/enrollments/${enrollment.id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Could not fetch enrollment data.');
    }

    const freshEnrollmentData: EnrollmentWithEvent = await response.json();
    
    // Generate PDF with fresh data
    const doc = generateEnrollmentPDF(freshEnrollmentData);
    const filename = `ticket-${freshEnrollmentData.event.name.replace(/\s+/g, '-')}-${freshEnrollmentData.id.substring(0, 8)}.pdf`;
    doc.save(filename);
    
    toast.success("ดาวน์โหลดบัตรเรียบร้อยแล้ว", { id: toastId });
    */

  } catch (error) {
    console.error('Download failed:', error);
    toast.error('ดาวน์โหลดไม่สำเร็จ', { 
      description: (error as Error).message,
      id: toastId
    });
  } finally {
    setIsDownloading(false);
  }
};

export function JoinedEventCard({ 
  enrollment,
}: JoinedEventCardProps) {
  // Add a local loading state to disable the button during the API call
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
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
        setTimeout(() => {
          window.location.reload();
        }, 1500);

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


  const handleDownloadTicketLocal = async () => {
  await handleDownloadTicket(enrollment, setIsDownloading, toast);
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

        <div className="flex items-center gap-2">
          {status === 'confirmed' && (
            <Button
            variant="outline"
            onClick={handleDownloadTicketLocal}
            disabled={isDownloading}
            >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Ticket className="h-4 w-4 mr-2" />
                )}
                {isDownloading ? "กำลังโหลด..." : "ดาวน์โหลดบัตร"}
              </Button>
            )}
          
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
        </div>
      </CardFooter>
    </Card>
  );
}

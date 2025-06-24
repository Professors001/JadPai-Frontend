import React from 'react';
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
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Enrollment } from '@/interfaces/Enrollment';
import { Event } from '@/interfaces/Event';

interface EnrollmentCardProps {
  enrollment: Enrollment;
  event?: Event; // Optional: to show which event
  onEdit?: (enrollmentId: string) => void;
  onDelete?: (enrollmentId: string) => void;
  onStatusChange?: (enrollmentId: string, newStatus: string) => void;
  showActions?: boolean;
}

export function EnrollmentCard({ 
  enrollment, 
  event,
  onEdit, 
  onDelete, 
  onStatusChange,
  showActions = true 
}: EnrollmentCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'approved':
        return { 
          variant: 'default' as const, 
          icon: CheckCircle, 
          text: 'ยืนยันแล้ว',
          color: 'text-green-600' 
        };
      case 'pending':
        return { 
          variant: 'secondary' as const, 
          icon: AlertCircle, 
          text: 'รอการยืนยัน',
          color: 'text-yellow-600' 
        };
      case 'cancelled':
      case 'rejected':
        return { 
          variant: 'destructive' as const, 
          icon: XCircle, 
          text: 'ยกเลิก',
          color: 'text-red-600' 
        };
      default:
        return { 
          variant: 'outline' as const, 
          icon: AlertCircle, 
          text: status,
          color: 'text-muted-foreground' 
        };
    }
  };

  const statusConfig = getStatusConfig(enrollment.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (date: Date) => {
    const reactDate = new Date(date)
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(reactDate);
  };

  const formatPhoneNumber = (phone: string) => {
    // Format Thai phone number: 0XX-XXX-XXXX
    if (phone.length === 10) {
      return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return phone;
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              {enrollment.name}
            </CardTitle>
            {event?.name && (
              <CardDescription className="mt-1">
                กิจกรรม: {event?.name}
              </CardDescription>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={statusConfig.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {statusConfig.text}
            </Badge>
            
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(enrollment.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    แก้ไข
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onStatusChange?.(enrollment.id, 'confirmed')}
                    disabled={enrollment.status === 'confirmed'}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    ยืนยัน
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onStatusChange?.(enrollment.id, 'cancelled')}
                    className="text-destructive focus:text-destructive"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    ยกเลิก
                  </DropdownMenuItem>
                  <Separator />
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(enrollment.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    ลบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-2">
            <p>ข้อมูลติดต่อ</p>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground min-w-0 flex-1 truncate">
              {enrollment.email}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">
              {formatPhoneNumber(enrollment.phone)}
            </span>
          </div>
        </div>

        <Separator />

        {/* Timestamps */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>ลงทะเบียน: {formatDate(enrollment.enroll_date)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>อัปเดต: {formatDate(enrollment.update_timestamp)}</span>
          </div>
        </div>

        {/* IDs (for admin/debug) */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>รหัสการลงทะเบียน: {enrollment.id}</div>
          <div>รหัสกิจกรรม: {enrollment.event_id}</div>
        </div>
      </CardContent>
    </Card>
  );
}
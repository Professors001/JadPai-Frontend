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
import { Users } from 'lucide-react';
import { EventDtos } from '@/dtos/EventDtos';
import { EnrollmentWithEvent } from '@/dtos/EnrollmentDtos';

// The props now expect a single `enrollment` object
interface JoinedEventCardProps {
  enrollment: EnrollmentWithEvent;
}

export function JoinedEventCard({ 
  enrollment
}: JoinedEventCardProps) {
  // Destructure for easier access
  const { event, status } = enrollment;
  const currentParticipants = event.confirmed_count;

  const isFullCapacity = currentParticipants >= event.max_cap;
  const capacityPercentage = (currentParticipants / event.max_cap) * 100;

  // Helper function to get the display text for a status
  const getStatusLabel = (status: typeof enrollment.status) => {
    switch (status) {
      case 'confirmed':
        return 'อนุมัติ';
      case 'rejected':
        return 'ปฏิเสธ';
      case 'pending':
        return 'รอดำเนินการ';
      case 'cancelled':
        return 'ยกเลิก';
      default:
        return status;
    }
  };

  // Helper function to get the tailwind color class for a status
  const getStatusColor = (status: typeof enrollment.status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      case 'pending':
        return 'text-yellow-500';
      case 'cancelled':
        return 'text-gray-500';
      default:
        return 'text-muted-foreground';
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
        {/* Description */}
        <CardDescription className="text-sm text-muted-foreground line-clamp-3">
          {event.description}
        </CardDescription>

        {/* Capacity Info */}
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
          
          {/* Capacity Progress Bar */}
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                capacityPercentage >= 90 
                  ? 'bg-destructive' 
                  : capacityPercentage >= 70 
                  ? 'bg-yellow-500' 
                  : 'bg-primary'
              }`}
              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Event ID (subtle) */}
        <div className="text-xs text-muted-foreground">
          รหัสกิจกรรม: {event.id}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2">
        <div className='flex flex-rows items-center justify-center gap-2'>
            <p className='text-muted-foreground text-sm'>สถานะการจอง:</p>
            <p className={`font-bold ${getStatusColor(status)}`}>
              {getStatusLabel(status)}
            </p>
        </div>
        
        {/* Show cancel button only if the user can take action */}
        {(status === 'pending' || status === 'confirmed') && (
            <Button 
              variant="destructive" 
              onClick={() => {
                console.log('Cancelling Enrollment for event:', event.id);
              }}
            >
              ยกเลิก
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}

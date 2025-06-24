import React from 'react';
// The import for 'next/link' has been removed to resolve the error.
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'; // Assuming these paths are correct
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { EditEventForm } from './edit-event-form';
import { Event } from '@/interfaces/Event';

interface OwnerEventCardProps {
  event: Event;
  currentParticipants?: number;
  isDetailPage?: boolean; // If true, the card is being used on a detail page.
  onEdit?: (eventId: string) => void;
}

export function OwnerEventCard({ 
  event, 
  currentParticipants = 0, 
  isDetailPage = false, // Default to false (list view behavior)
  onEdit,
}: OwnerEventCardProps) {
  const isFullCapacity = currentParticipants >= event.max_cap;
  // Prevent division by zero if max_cap is 0
  const capacityPercentage = event.max_cap > 0 ? (currentParticipants / event.max_cap) * 100 : 0;

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
        {/* Description: Show full text on detail page, clamp on list view. */}
        <CardDescription 
          className={`text-sm text-muted-foreground ${!isDetailPage ? 'line-clamp-3' : ''}`}
        >
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

      {/* Footer: The logic is now corrected. It uses a standard <a> tag for navigation. */}
      <CardFooter>
        {isDetailPage ? (
          <EditEventForm event={event} />
        ) : (
          // Using a standard anchor tag <a> for the link to avoid build errors.
          <a href={`/events/${event.id}`} className="w-full">
            <Button className="w-full py-6">
              ดูข้อมูล
            </Button>
          </a>
        )}
      </CardFooter>
    </Card>
  );
}

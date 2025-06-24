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
import { Calendar, Users, MapPin, Clock } from 'lucide-react';

export default interface Event {
  id: string;
  name: string;
  description: string;
  max_cap: number;
}

interface EventCardProps {
  event: Event;
  currentParticipants?: number; // Optional: to show current vs max capacity
  onJoin?: (eventId: string) => void;
  onViewDetails?: (eventId: string) => void;
}

export function EventCard({ 
  event, 
  currentParticipants = 0, 
  onJoin
}: EventCardProps) {
  const isFullCapacity = currentParticipants >= event.max_cap;
  const capacityPercentage = (currentParticipants / event.max_cap) * 100;

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

      <CardFooter className="flex gap-2">
        <Button 
          className="flex-1 py-6"
          disabled={isFullCapacity}
          onClick={() => onJoin?.(event.id)}
        >
          {isFullCapacity ? "เต็มแล้ว" : "เข้าร่วม"}
        </Button>
      </CardFooter>
    </Card>
  );
}
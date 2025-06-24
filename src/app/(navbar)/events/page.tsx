'use client'

import { EnrollmentCard } from "@/components/enrollment-card";
import { EventCard } from "@/components/event-card"
import { JoinedEventCard } from "@/components/joined-event-card"
import { OwnerEventCard } from "@/components/owner-event-card"
import { Button } from "@/components/ui/button";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Event } from "@/interfaces/Event";

import { useEffect, useState } from "react";
import { CreateEventForm } from "@/components/create-event-form";
import { EnrollmentWithEvent } from "@/dtos/EnrollmentDtos";

export default function EventsPage() {

    const [events, setEvents] = useState<Event[]>([]);
    const [enrollments, setEnrollments] = useState<EnrollmentWithEvent[]>([]);
    async function fetchEvents() {
        try {
            const res = await fetch(`http://localhost:6969/events`);
            
            if (!res.ok) {
                throw new Error('Failed to fetch Events');
            }
            
            const resJson = await res.json();
            // console.log("Fetched Events:", resJson);
            setEvents(resJson || []);
            console.log("Fetched Events Success");
        } catch (err: any) {
            console.error("Error fetching Events:", err);
        }
    }

    async function fetchEnrollment() {
        try {
            const res = await fetch(`http://localhost:6969/enrollments/users/2`); // MockUp UID
            
            if (!res.ok) {
                throw new Error('Failed to fetch Enrollment');
            }
            
            const resJson = await res.json();
            // console.log("Fetched Enrollment:", resJson);
            setEnrollments(resJson || []);
            console.log("Fetched Enrollment Success");
        } catch (err: any) {
            console.error("Error fetching Enrollment:", err);
        }
    }

    useEffect(() => {
        fetchEvents();
        fetchEnrollment();
    }, []);

    const handleJoin = (eventId: string) => {
        console.log('Join event:', eventId);
    };

    return (
        <div className="flex items-center justify-center pt-16">
            <div className="flex flex-col items-center justify-center w-5xl">
                <div className="w-full flex flex-col gap-4">
                    
                    <CreateEventForm />

                    <Tabs defaultValue="all">
                        <TabsList>
                            <TabsTrigger value="all">ยังไม่ลงทะเบียน</TabsTrigger>
                            <TabsTrigger value="joined">ลงทะเบียนแล้ว</TabsTrigger>
                            <TabsTrigger value="owner">OWNER</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                            <div className="flex flex-col gap-3">
                                {events.map((event, index) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        currentParticipants={index === 0 ? 25 : index === 1 ? 48 : 5} // Sample data
                                        onJoin={handleJoin}
                                    />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="joined">
                            <div className="flex flex-col gap-3">
                                {events.map((event, index) => (
                                    <JoinedEventCard
                                        key={event.id}
                                        event={event}
                                        currentParticipants={index === 0 ? 25 : index === 1 ? 48 : 5} // Sample data
                                    />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="owner">
                            <div className="flex flex-col gap-3">
                                {events.map((event, index) => (
                                    <OwnerEventCard
                                        key={event.id}
                                        event={event}
                                        currentParticipants={index === 0 ? 25 : index === 1 ? 48 : 5} // Sample data
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
                
            </div>
        </div>
    )
}
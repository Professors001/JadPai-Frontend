'use client'

import { EventCard } from "@/components/event-card"
import { JoinedEventCard } from "@/components/joined-event-card"
import { OwnerEventCard } from "@/components/owner-event-card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import { useEffect, useState } from "react";
import { CreateEventForm } from "@/components/create-event-form";
import { EnrollmentWithEvent } from "@/dtos/EnrollmentDtos";
import { EventDtos } from "@/dtos/EventDtos";
import { User } from "@/interfaces/User";

export default function EventsPage() {

    const [events, setEvents] = useState<EventDtos[]>([]);
    const [enrollments, setEnrollments] = useState<EnrollmentWithEvent[]>([]);
    const [ownerEvents, setOwnerEvents] = useState<EventDtos[]>([]); // State for owner's events
    const [isLoading, setIsLoading] = useState(true);

    // State to hold the user ID. It starts as null.
    const [userId, setUserId] = useState<string | null>(null);

    // --- REFACTORED EFFECT: Get User and Fetch All Data ---
    // This single effect runs once on mount. It gets the user ID and then
    // immediately fetches all necessary data, avoiding race conditions.
    useEffect(() => {
        const storedUser = localStorage.getItem('user');

        // This function is defined inside so it can be called right after getting the ID.
        async function fetchAllDataForUser(currentUserId: string) {
            setIsLoading(true);
            try {
                // Fetch all data in parallel for better performance
                await Promise.all([
                    fetchEvents(currentUserId),
                    fetchEnrollment(currentUserId),
                    fetchOwnerEvents(currentUserId)
                ]);
            } catch (error) {
                console.error("An error occurred during data fetching:", error);
            } finally {
                setIsLoading(false); // Stop loading regardless of success or error
            }
        }

        if (storedUser) {
            try {
                const userData: User = JSON.parse(storedUser);
                setUserId(userData.id); // Set state for the UI
                fetchAllDataForUser(userData.id); // Immediately fetch data with the new ID
            } catch (error) {
                console.error("Failed to parse user data", error);
                setIsLoading(false);
            }
        } else {
            console.log("No user data found in localStorage.");
            setIsLoading(false);
        }
    }, []); // Empty dependency array `[]` ensures this runs only once.

    async function fetchEvents(currentUserId: string) {
        try {
            const res = await fetch(`http://localhost:6969/events/users/${currentUserId}/not_attending`);
            if (!res.ok) throw new Error('Failed to fetch Events');
            const resJson = await res.json();
            setEvents(resJson || []);
            console.log("Fetched Not-Attending Events Success for user:", currentUserId);
        } catch (err: any) {
            console.error("Error fetching Events:", err.message);
        }
    }

    async function fetchEnrollment(currentUserId: string) {
        try {
            const res = await fetch(`http://localhost:6969/enrollments/users/${currentUserId}`); 
            if (!res.ok) throw new Error('Failed to fetch Enrollment');
            const resJson = await res.json();
            setEnrollments(resJson || []);
            console.log("Fetched Enrollments Success for user:", currentUserId);
        } catch (err: any) {
            console.error("Error fetching Enrollment:", err.message);
        }
    }

    async function fetchOwnerEvents(currentUserId: string) {
        try {
            const res = await fetch(`http://localhost:6969/events`); 
            if (!res.ok) throw new Error('Failed to fetch Owner Events');
            const resJson = await res.json();
            setOwnerEvents(resJson || []);
            console.log("Fetched Owner Events Success for user:", currentUserId);
        } catch (err: any) {
            console.error("Error fetching Owner Events:", err.message);
        }
    }

    const handleJoin = (eventId: string) => {
        console.log('Join event:', eventId);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center pt-32">
                <p>Loading events...</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center pt-16">
            <div className="w-full max-w-5xl">
                <div className="w-full flex flex-col gap-4">
                    
                    <CreateEventForm />

                    <Tabs defaultValue="all">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="all">ยังไม่ลงทะเบียน</TabsTrigger>
                            <TabsTrigger value="joined">ลงทะเบียนแล้ว</TabsTrigger>
                            <TabsTrigger value="owner">กิจกรรมของคุณ</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                            <div className="flex flex-col gap-3">
                                {events.length > 0 ? (
                                    events.map((event) => (
                                        <EventCard
                                            key={event.id}
                                            event={event}
                                            currentParticipants={event.confirmed_count}
                                            onJoin={handleJoin}
                                        />
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground pt-4">ไม่มีกิจกรรมที่ยังไม่ได้ลงทะเบียน</p>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="joined">
                            <div className="flex flex-col gap-3">
                                {enrollments.length > 0 ? (
                                    enrollments.map((enrollment) => (
                                        <JoinedEventCard
                                            key={enrollment.id}
                                            enrollment={enrollment}
                                        />
                                    ))
                                 ) : (
                                    <p className="text-center text-muted-foreground pt-4">คุณยังไม่ได้ลงทะเบียนเข้าร่วมกิจกรรมใดๆ</p>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="owner">
                            <div className="flex flex-col gap-3">
                                {ownerEvents.length > 0 ? (
                                    ownerEvents.map((event) => (
                                        <OwnerEventCard
                                            key={event.id}
                                            event={event}
                                            currentParticipants={event.confirmed_count}
                                        />
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground pt-4">คุณยังไม่ได้สร้างกิจกรรมใดๆ</p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

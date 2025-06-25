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
import { User } from "@/interfaces/User"

export default function EventsPage() {
    const [events, setEvents] = useState<EventDtos[]>([]);
    const [enrollments, setEnrollments] = useState<EnrollmentWithEvent[]>([]);
    const [ownerEvents, setOwnerEvents] = useState<EventDtos[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // State to hold the user ID and role
    const [userId, setUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');

        async function fetchRelevantDataForUser(user: User) {
            setIsLoading(true);
            try {
                if (user.role === 'admin') {
                    // Admins only need to see the events they own
                    await fetchOwnerEvents(user.id);
                } else {
                    // Regular users need to see events they can join and events they have joined
                    await Promise.all([
                        fetchEvents(user.id),
                        fetchEnrollment(user.id),
                    ]);
                }
            } catch (error) {
                console.error("An error occurred during data fetching:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (storedUser) {
            try {
                const userData: User = JSON.parse(storedUser);
                setUserId(userData.id);
                setUserRole(userData.role); // Set the user's role
                fetchRelevantDataForUser(userData);
            } catch (error) {
                console.error("Failed to parse user data", error);
                setIsLoading(false);
            }
        } else {
            console.log("No user data found in localStorage.");
            setIsLoading(false);
        }
    }, []);

    async function fetchEvents(currentUserId: string) {
        try {
            const res = await fetch(`http://localhost:6969/events/users/${currentUserId}/not_attending`);
            if (!res.ok) throw new Error('Failed to fetch Events');
            const resJson = await res.json();
            setEvents(resJson || []);
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
                    
                    {/* Admins can create events */}
                    {userRole === 'admin' && <CreateEventForm />}

                    {/* Conditionally render tabs based on user role */}
                    <Tabs defaultValue={userRole === 'admin' ? 'owner' : 'all'}>
                        <TabsList className={`grid w-full ${userRole === 'admin' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {userRole !== 'admin' && (
                                <>
                                    <TabsTrigger value="all">ยังไม่ลงทะเบียน</TabsTrigger>
                                    <TabsTrigger value="joined">ลงทะเบียนแล้ว</TabsTrigger>
                                </>
                            )}
                            {userRole === 'admin' && (
                                <TabsTrigger value="owner">กิจกรรมของคุณ</TabsTrigger>
                            )}
                        </TabsList>

                        {/* Content for regular users */}
                        {userRole !== 'admin' && (
                            <>
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
                            </>
                        )}

                        {/* Content for admins */}
                        {userRole === 'admin' && (
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
                        )}
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

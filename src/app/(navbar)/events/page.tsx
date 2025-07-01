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
import { jwtDecode } from "jwt-decode"; // ✨ 1. Import jwt-decode
import { CreateEventForm } from "@/components/create-event-form";
import { EnrollmentWithEvent } from "@/dtos/EnrollmentDtos";
import { EventDtos } from "@/dtos/EventDtos";


export default function EventsPage() {
    const [events, setEvents] = useState<EventDtos[]>([]);
    const [enrollments, setEnrollments] = useState<EnrollmentWithEvent[]>([]);
    const [ownerEvents, setOwnerEvents] = useState<EventDtos[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [userId, setUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    // ✨ 2. This useEffect is modified to read from sessionStorage and decode the JWT
    useEffect(() => {
        const token = sessionStorage.getItem('token');

        async function fetchRelevantDataForUser(user: UserLoginData) {
            setIsLoading(true);
            try {
                if (user.role === 'admin') {
                    await fetchOwnerEvents();
                } else {
                    await Promise.all([
                        fetchEvents(String(user.id)), // Convert user.id to string for the fetch call
                        fetchEnrollment(String(user.id)),
                    ]);
                }
            } catch (error) {
                console.error("An error occurred during data fetching:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (token) {
            try {
                const userData: UserLoginData = jwtDecode(token);
                
                // Set the component's state based on the decoded token
                setUserId(String(userData.id));
                setUserRole(userData.role);
                
                // Fetch data relevant to the logged-in user
                fetchRelevantDataForUser(userData);

            } catch (error) {
                console.error("Failed to decode token:", error);
                setIsLoading(false);
            }
        } else {
            console.log("No token found in sessionStorage. User is not logged in.");
            setIsLoading(false);
            // Optional: Redirect to login if no token is found
            // window.location.href = '/login';
        }
    }, []);

    async function fetchEvents(currentUserId: string) {
        try {
            const res = await fetch(`http://localhost:6969/events/users/${currentUserId}/not_attending`
                , {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    },
                }
            );
            if (!res.ok) throw new Error('Failed to fetch Events');
            const resJson = await res.json();
            setEvents(resJson || []);
        } catch (err: any) {
            console.error("Error fetching Events:", err.message);
        }
    }

    async function fetchEnrollment(currentUserId: string) {
        try {
            const res = await fetch(`http://localhost:6969/enrollments/users/${currentUserId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    },
                });
            if (!res.ok) throw new Error('Failed to fetch Enrollment');
            const resJson = await res.json();
            setEnrollments(resJson || []);
        } catch (err: any) {
            console.error("Error fetching Enrollment:", err.message);
        }
    }

    async function fetchOwnerEvents() {
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
    
    // The rest of your component's JSX remains the same
    return (
        <div className="flex items-center justify-center pt-16">
            <div className="w-full max-w-5xl">
                <div className="w-full flex flex-col gap-4">
                    
                    {userRole === 'admin' && <CreateEventForm />}

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
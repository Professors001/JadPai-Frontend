'use client'

import React, { use, useEffect, useState } from 'react';
import { OwnerEventCard } from '@/components/owner-event-card';
import { Enrollment } from '@/interfaces/Enrollment';
import EnrollmentCard from '@/components/enrollment-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventDtos } from '@/dtos/EventDtos';



export default function EventDetailPage({ params }: { params: Promise<{ id: string }>  }) {

    const [event, setEvent] = useState<EventDtos | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const eventId = use(params).id;

    useEffect(() => {
        async function fetchEventData() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`http://localhost:6969/events/${eventId}`);
                if (!res.ok) throw new Error(`Failed to fetch event. Status: ${res.status}`);
                const data: EventDtos = await res.json();
                setEvent(data);
                // console.log("Fetched event:", data);
                
            } catch (err: any) {
                console.error("Error fetching event:", err);
                setError(err.message || "An unknown error occurred");
            } finally {
                setLoading(false);
            }
        }

        async function fetchEnrollment() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`http://localhost:6969/enrollments/events/${eventId}` , {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    },
                });
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
        
        if (eventId) {
            fetchEventData();
            fetchEnrollment();
        } else {
            setLoading(false);
            setError("No event ID provided.");
        }
    }, [eventId]);

    if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-xl">Loading event details...</p></div>;
    if (error) return <div className="flex items-center justify-center min-h-screen"><p className="text-xl text-red-500">Error: {error}</p></div>;
    if (!event) return <div className="flex items-center justify-center min-h-screen"><p className="text-xl">Event with ID '{eventId}' not found.</p></div>;

    return (
        <div className="flex flex-col items-center pt-16 px-4">
            <div className="w-full max-w-5xl space-y-4">
                <header className='flex flex-col gap-2'>
                    <a href="/events" className="flex items-center gap-2 underline">กลับไปหน้าแรก</a>
                    <h1 className="text-3xl font-bold">Event Detail Page</h1>
                    <p className="text-muted-foreground">Event ID: {eventId}</p>
                </header>

                <OwnerEventCard
                    key={event.id}
                    event={event}
                    currentParticipants={event.confirmed_count}
                    isDetailPage={true}
                    onEdit={(id) => console.log(`Edit button clicked for event: ${id}`)}
                />

                <h2 className="text-xl font-bold">ผู้เข้าร่วม</h2>

                <Tabs defaultValue="all">
                        <TabsList>
                            <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
                            <TabsTrigger value="pending">ยังไม่อนุมัติ</TabsTrigger>
                            <TabsTrigger value="confirmed">อนุมัติ</TabsTrigger>
                            <TabsTrigger value="rejected">ไม่อนุมัติ</TabsTrigger>
                            <TabsTrigger value="cancelled">ยกเลิก</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                            <div className="flex flex-col gap-3">
                                {enrollments.map((enrollment, index) => (
                                    <EnrollmentCard
                                        key={index} 
                                        enrollData={enrollment}
                                    />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="pending">
                            <div className="flex flex-col gap-3">
                                {enrollments
                                    .filter(enrollment => enrollment.status === 'pending') // First, filter the array
                                    .map((enrollment, index) => ( // Then, map over the filtered results
                                        <EnrollmentCard
                                            key={index} 
                                            enrollData={enrollment}
                                        />
                                    ))}
                            </div>
                            
                        </TabsContent>

                        <TabsContent value="confirmed">
                            <div className="flex flex-col gap-3">
                                {enrollments
                                    .filter(enrollment => enrollment.status === 'confirmed') // First, filter the array
                                    .map((enrollment, index) => ( // Then, map over the filtered results
                                        <EnrollmentCard
                                            key={index} 
                                            enrollData={enrollment}
                                        />
                                    ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="rejected">
                            <div className="flex flex-col gap-3">
                                {enrollments
                                    .filter(enrollment => enrollment.status === 'rejected') // First, filter the array
                                    .map((enrollment, index) => ( // Then, map over the filtered results
                                        <EnrollmentCard
                                            key={index} 
                                            enrollData={enrollment}
                                        />
                                    ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="cancelled">
                            <div className="flex flex-col gap-3">
                                {enrollments
                                    .filter(enrollment => enrollment.status === 'cancelled') // First, filter the array
                                    .map((enrollment, index) => ( // Then, map over the filtered results
                                        <EnrollmentCard
                                            key={index} 
                                            enrollData={enrollment}
                                        />
                                    ))}
                            </div>
                        </TabsContent>
                    </Tabs>
            </div>
        </div>
    );
}

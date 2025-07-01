'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';

import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { User, LogOut, Settings, Moon, Sun, Timer } from 'lucide-react'; // Added Timer icon
import { EditProfileForm } from './edit-user-form';


const Navbar = () => {
    const { theme, setTheme } = useTheme();
    const [user, setUser] = useState<UserLoginData | null>(null);
    const [timeLeft, setTimeLeft] = useState(''); // ✨ 1. State for the countdown timer

    // This effect handles setting the user on initial load
    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token) {
            try {
                const decodedUser: UserLoginData = jwtDecode(token);
                if (decodedUser.exp * 1000 > Date.now()) {
                    setUser(decodedUser);
                } else {
                    sessionStorage.removeItem('token');
                }
            } catch (error) {
                console.error("Failed to decode token", error);
                sessionStorage.removeItem('token');
            }
        } else {
            toast.error("ไม่พบข้อมูลผู้ใช้", {
            description: "กรุณาลองใหม่อีกครั้งหรือกลับไปที่หน้าเข้าสู่ระบบ",
            action: {
                label: "ไปที่หน้าเข้าสู่ระบบ",
                onClick: () => {
                    window.location.href = "/login";
                },
            },
            duration: Infinity,
            });
        }
    }, []);

    // ✨ 2. This effect manages the countdown timer
    useEffect(() => {
        if (!user) {
            setTimeLeft('');
            return;
        }

        const intervalId = setInterval(() => {
            const remainingSeconds = Math.floor(user.exp - Date.now() / 1000);

            if (remainingSeconds <= 0) {
                setTimeLeft('Expired');
                clearInterval(intervalId);
                // Optional: Automatically log out when the session expires
                // handleLogout(); 
            } else {
                const minutes = Math.floor(remainingSeconds / 60);
                const seconds = remainingSeconds % 60;
                setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        }, 1000);

        // Cleanup function to clear the interval
        return () => clearInterval(intervalId);

    }, [user]); // Reruns when the user logs in or out

    const handleLogout = () => {
        toast.success("ลงชื่อออกสำเร็จ!");
        sessionStorage.removeItem('token');
        setUser(null); // Clear user state immediately
        setTimeout(() => {
            window.location.href = '/login';
        }, 500);
    };

    const getInitials = (name: string, surname: string) => {
        const firstInitial = name ? name[0] : '';
        const lastInitial = surname ? surname[0] : '';
        return `${firstInitial}${lastInitial}`.toUpperCase();
    }

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <Link href={user ? "/events" : "/login"} className="flex items-center hover:opacity-80 transition-opacity">
                <span className="text-3xl font-semibold text-foreground">JadPai</span>
            </Link>

            <div className="flex items-center space-x-6">
                {user ? (
                    <>
                        {/* ... (Other links) */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="" alt={`${user.name} ${user.surname}`} />
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            {getInitials(user.name, user.surname)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden md:flex flex-col text-sm text-left">
                                        <p className="font-medium text-foreground">{`${user.name} ${user.surname}`}</p>
                                        <div className='flex gap-3'>
                                            {/* <p className="text-muted-foreground text-xs">{user.role.toUpperCase()}</p> */}
                                            {/* ✨ 3. Display the live timer */}
                                            {timeLeft && (
                                                <p className="text-muted-foreground text-xs flex items-center gap-1">
                                                    เวลาใช้งานคงเหลือ
                                                    <Timer className="h-3 w-3" />
                                                    {timeLeft}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                {/* ... (Dropdown menu items) */}
                                <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <EditProfileForm />
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>ลงชื่อออก</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : (
                    <Link href="/login">
                         <Button>เข้าสู่ระบบ</Button>
                    </Link>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="h-9 w-9"
                >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>
        </nav>
    );
};

export default Navbar;
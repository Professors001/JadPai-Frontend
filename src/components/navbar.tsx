'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

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
import { User, LogOut, Settings, Moon, Sun } from 'lucide-react';
import { EditProfileForm } from './edit-user-form';

// Define a type for the user object stored in localStorage
interface UserProfile {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
}

const Navbar = () => {
    const { theme, setTheme } = useTheme();
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse user data from localStorage", error);
                localStorage.removeItem('user');
            }
        } else {
            const publicPaths = ['/login', '/signup'];
            const currentPath = window.location.pathname;
            
            if (!publicPaths.includes(currentPath)) {
                window.location.href = '/login';
            }
        }
    }, []);

    const handleLogout = () => {
        toast.success("ลงชื่อออกสำเร็จ!");
        
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
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
                        <Link href="/events">
                            <Badge 
                                variant="outline" 
                                className="cursor-pointer px-4 py-2 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                                รายการกิจกรรม
                            </Badge>
                        </Link>

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
                                        <p className="text-muted-foreground text-xs">{user.role}</p>
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                
                                {/* Use the EditProfileForm to wrap the DropdownMenuItem */}
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

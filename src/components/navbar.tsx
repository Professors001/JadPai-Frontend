'use client';

import Link from 'next/link';
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
import { useTheme } from 'next-themes';

const Navbar = () => {
    const { theme, setTheme } = useTheme();

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            {/* Logo Section */}
            <Link href="/events" className="flex items-center hover:opacity-80 transition-opacity">
                <span className="text-3xl font-semibold text-foreground">Advice</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
                {/* Activity Badge */}
                <Badge 
                    variant="outline" 
                    className="cursor-pointer px-4 py-2 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                    รายการกิจกรรม
                </Badge>

                {/* User Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/placeholder-avatar.jpg" alt="อภิสิทธิ์" />
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    อภ
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-sm">
                                <p className="font-medium text-foreground">อภิสิทธิ์ ประเสริ.....</p>
                                <p className="text-muted-foreground text-xs">ข้อมูลส่วนตัว</p>
                            </div>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            <span>ข้อมูลส่วนตัว</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>การตั้งค่า</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => {
                                console.log('logout');
                            }}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>ลงชื่อออก</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme Toggle */}
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

                {/* Logout Button (Alternative) */}
                <Button 
                    variant="destructive" 
                    onClick={() => { 
                        console.log('logout');
                    }} 
                    className="px-4 py-2 rounded-full"
                >
                    <a href="/login">ลงชื่อออก</a>
                </Button>
            </div>
        </nav>
    );
};

export default Navbar;
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Mail, Phone, FileImage, User, Clock, Save, Eye } from 'lucide-react';
import { Enrollment } from '@/interfaces/Enrollment';
import { toast } from 'sonner';

interface EnrollCardProps {
  enrollData: Enrollment;
  onStatusChange?: (id: string, newStatus: string) => void;
  isAttendanceCancelled?: boolean;
}

const EnrollmentCard: React.FC<EnrollCardProps> = ({ 
  enrollData, 
  onStatusChange,
  isAttendanceCancelled = false
}) => {
  const [currentStatus, setCurrentStatus] = useState(enrollData.status);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  // Check if status can be changed
  const canChangeStatus = !isAttendanceCancelled && currentStatus !== 'cancelled';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'อนุมัติ';
      case 'rejected':
        return 'ปฏิเสธ';
      case 'pending':
        return 'รอดำเนินการ';
      case 'cancelled':
        return 'ยกเลิก';
      default:
        return status;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!canChangeStatus) return;

    // The logic to get the token and check for its existence has been removed.

    try {
        const response = await fetch(`http://localhost:6969/enrollments/${enrollData.id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newStatus: newStatus }),
        });
        
        console.log(response);
        

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update status on the server.');
        }
        
        const result = await response.json();
        console.log(result.message);

        setCurrentStatus(newStatus as 'pending' | 'confirmed' | 'rejected' | 'cancelled');
        toast.success('เปลี่ยนสถานะเรียบร้อย');
        
        if (onStatusChange) {
            onStatusChange(enrollData.id, newStatus);
        }

    } catch (error) {
        console.error('Error updating enrollment status:', error);
        toast.error('Update Failed', { description: (error as Error).message });
    }
};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            การสมัครเข้าร่วม #{enrollData.id}
          </CardTitle>
          <Badge className={`${getStatusColor(currentStatus)} text-base px-5 py-2`}>
            {getStatusLabel(currentStatus)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* User Information */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="" alt={enrollData.name} />
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(enrollData.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{enrollData.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">User ID: {enrollData.user_id}</p>
          </div>
        </div>

        <Separator />

        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Phone className="h-4 w-4" />
            ข้อมูลติดต่อ
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">อีเมล</p>
                <p className="font-medium dark:text-gray-200">{enrollData.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">เบอร์โทรศัพท์</p>
                <p className="font-medium dark:text-gray-200">{enrollData.phone}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Evidence Image */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            รูปภาพหลักฐาน
          </h4>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src={"http://localhost:6969" + enrollData.evidence_img_path} 
                alt="Evidence" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxNkMyMS4xMDQ2IDE2IDIyIDEzLjEwNDYgMjIgMTJDMjIgMTAuODk1NCAyMS4xMDQ2IDEwIDIwIDEwQzE4Ljg5NTQgMTAgMTggMTAuODk1NCAxOCAxMkMxOCAxMy4xMDQ2IDE4Ljg5NTQgMTYgMjAgMTZaIiBmaWxsPSIjOUM5Qzk3Ii8+CjxwYXRoIGQ9Ik0yOCAyOEgxMkMxMS40NDc3IDI4IDExIDI3LjU1MjMgMTEgMjdWMTVDMTEgMTQuNDQ3NyAxMS40NDc3IDE0IDEyIDE0SDI4QzI4LjU1MjMgMTQgMjkgMTQuNDQ3NyAyOSAxNVYyN0MyOSAyNy41NTIzIDI4LjU1MjMgMjggMjggMjhaIiBzdHJva2U9IiM5QzlDOTciIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
                }}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">ไฟล์หลักฐาน</p>
              <p className="font-medium text-sm truncate">{enrollData.evidence_img_path}</p>
              <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Eye className="h-4 w-4 mr-2" />
                    ดูรูปภาพ
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>รูปภาพหลักฐาน</DialogTitle>
                  </DialogHeader>
                  <div className="flex justify-center">
                    <img 
                      src={"http://localhost:6969" + enrollData.evidence_img_path} 
                      alt="Evidence Full Size" 
                      className="max-w-full max-h-96 object-contain rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgODBDMTA1LjUyMyA4MCAxMTAgNzUuNTIzIDExMCA3MEMxMTAgNjQuNDc3IDEwNS41MjMgNjAgMTAwIDYwQzk0LjQ3NyA2MCA5MCA2NC40NzcgOTAgNzBDOTAgNzUuNTIzIDk0LjQ3NyA4MCAxMDAgODBaIiBmaWxsPSIjOUM5Qzk3Ii8+CjxwYXRoIGQ9Ik0xNDAgMTQwSDYwQzU3LjIzODYgMTQwIDU1IDEzNy43NjEgNTUgMTM1Vjc1QzU1IDcyLjIzODYgNTcuMjM4NiA3MCA2MCA3MEgxNDBDMTQyLjc2MSA3MCA1NCA3Mi4yMzg2IDE0NSA3NVYxMzVDMTQ1IDEzNy43NjEgMTQyLjc2MSAxNDAgMTQwIDE0MFoiIHN0cm9rZT0iIzlDOUM5NyIgc3Ryb2tlLXdpZHRoPSI0Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUM5Qzk3IiBmb250LXNpemU9IjE0Ij7guYTguKHguYjguKrguLLguKHguLLguKPguJbguJTguKnguLPguJDguKHguYjguKLguLLguJc8L3RleHQ+Cjwvc3ZnPgo=';
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <Separator />

        {/* Date Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <CalendarDays className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">วันที่สมัคร</p>
              <p className="font-medium text-sm dark:text-gray-200">{formatDate(enrollData.enroll_date.toString())}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">อัพเดทล่าสุด</p>
              <p className="font-medium text-sm dark:text-gray-200">{formatDate(enrollData.update_timestamp.toString())}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Status Management */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">จัดการสถานะ</h4>
          
          {/* Show warning message if cancelled */}
          {currentStatus === 'cancelled' && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-sm font-medium text-orange-800 dark:text-orange-400">
                  การสมัครนี้ถูกยกเลิกเนื่องจากไม่เข้าร่วมกิจกรรม
                </span>
              </div>
            </div>
          )}
          
          {/* Show warning if attendance cancelled but status isn't cancelled yet */}
          {isAttendanceCancelled && currentStatus !== 'cancelled' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium text-red-800 dark:text-red-400">
                  ไม่สามารถเปลี่ยนสถานะได้เนื่องจากไม่เข้าร่วมกิจกรรม
                </span>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            <Select 
              value={currentStatus} 
              onValueChange={handleStatusChange}
              disabled={!canChangeStatus}
            >
              <SelectTrigger className={`w-48 ${getStatusColor(currentStatus)} ${!canChangeStatus ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <SelectValue placeholder="เลือกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending" className="text-yellow-800 dark:text-yellow-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    รอดำเนินการ
                  </div>
                </SelectItem>
                <SelectItem value="confirmed" className="text-green-800 dark:text-green-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    อนุมัติ
                  </div>
                </SelectItem>
                <SelectItem value="rejected" className="text-red-800 dark:text-red-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    ปฏิเสธ
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnrollmentCard;
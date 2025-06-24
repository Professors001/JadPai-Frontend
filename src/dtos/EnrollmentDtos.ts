export interface EnrollmentWithEvent {
    id : string;
    user_id : string;
    event_id : string;
    name : string;
    email : string;
    phone : string;
    status : string;
    img_path : string;
    enroll_date : Date;
    update_timestamp : Date;
    
    event : Event
}
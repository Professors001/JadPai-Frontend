export interface Enrollment {
    id : string;
    user_id : string;
    event_id : string;
    name : string;
    email : string;
    phone : string;
    status : string;
    evidence_img_path : string;
    enroll_date : Date;
    update_timestamp : Date;
}
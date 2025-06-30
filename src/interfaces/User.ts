export interface User {
    id : string;
    name : string;
    surname : string;
    email : string;
    phone : string;
    password_hash? : string;
    role : string;
    google_id? : string;
    created_at : Date;
}
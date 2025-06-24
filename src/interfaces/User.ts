export interface User {
    id : string;
    name : string;
    surname : string;
    email : string;
    phone : string;
    password_hash : string;
    role : string;
    img_path : string;
    created_at : Date;
}
export interface Event {
    id: string;
    name: string;
    description: string;
    max_cap: number;
    creator_id: string;

    confirmed_count : number;
}
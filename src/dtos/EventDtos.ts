export interface EventDtos {
    id: string;
    name: string;
    description: string;
    max_cap: number;
    creator_id: string;

    confirmed_count : number;
}
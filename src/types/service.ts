export interface IService {
    id: string;
    created_at: string;
    description: string; // popis prace
    date: string; // datum servisu
    duration: string; // delka trvani
    customer: string; // zakaznik
    order_number: string; // cislo zakazky
}

export interface WhatsappConnectionInterface {
    id: string;
    connection_name: string;
    serialized_number: string;
    is_active: boolean;
    unserialized_number: number;
    userId: string;
    group: Group;
}

interface Group {
    whatssap_id: string;
    name: string;
}

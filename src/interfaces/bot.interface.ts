interface WhatsappConnection {
    id: string;
    connection_name: string;
    serialized_number: string;
    is_active: boolean;
    unserialized_number: number;
    userId: string;
}

interface Strategy {
    id: string;
    preset_colors: number[];
    bet_color: number;
    botId: string;
}

export interface BotInterface {
    id: string;
    name: string;
    signalType: string;
    gameType: string;
    finish_messages: string[];
    bet_message: string;
    green_message: string;
    red_message: string;
    welcome_messages: string[];
    target_group: string;
    finish_time: number;
    signal_interval: number;
    in_use: boolean;
    max_signal: number;
    whatsappConnectionId: string;
    whatsappConnection: WhatsappConnection;
    strategies: Strategy[];
}

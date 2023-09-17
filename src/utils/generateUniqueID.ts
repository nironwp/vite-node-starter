export default function generateUniqueID() {
    const timestamp = Date.now().toString(16); // Converte o carimbo de data/hora para uma representação hexadecimal
    const randomValue = Math.random().toString(16).substr(2, 6); // Gera um número aleatório hexadecimal de 6 caracteres

    return timestamp + randomValue;
}

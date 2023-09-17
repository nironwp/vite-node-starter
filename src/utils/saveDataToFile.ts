import * as fs from 'fs/promises';
import path from 'path';
async function ensureDirectoryExistence(filePath: string) {
    const dirname = path.dirname(filePath);

    try {
        await fs.access(dirname);
    } catch (error) {
        await fs.mkdir(dirname, { recursive: true });
    }
}

export default async function saveDataToFile(filePath: string, data: any) {
    try {
        // Garante que o diretório existe
        await ensureDirectoryExistence(filePath);

        // Convertendo os dados para JSON
        const jsonData = JSON.stringify(data, null, 2);

        // Escrevendo os dados JSON no arquivo
        await fs.writeFile(filePath, jsonData, 'utf8');
    } catch (error) {
        console.error('Erro ao escrever o arquivo:', error);
    }
}

import * as fs from 'fs-extra';

export default async function readJsonFile<T>(
    filePath: string
): Promise<T | null> {
    try {
        const fileContents = await fs.readFile(filePath, 'utf-8');
        const jsonObject = JSON.parse(fileContents) as T;
        return jsonObject;
    } catch (error) {
        console.error('Erro ao ler o arquivo JSON:', error);
        return null;
    }
}

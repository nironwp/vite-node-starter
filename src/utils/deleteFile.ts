import * as fs from 'fs/promises';
export default async function deleteFile(filePath: string) {
    try {
        await fs.unlink(filePath);
    } catch (error) {
        console.error('Erro ao excluir o arquivo:', error);
    }
}

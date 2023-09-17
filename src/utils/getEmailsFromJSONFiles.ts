import path from 'path';
import fs from 'fs';
export default function getEmailsFromJSONFiles(folderPath: string) {
    try {
        // Lê todos os arquivos no diretório
        const files = fs.readdirSync(folderPath);

        console.log(files)
        // Filtra os arquivos para pegar apenas os .json
        const jsonFiles = files.filter(
            (file: string) => path.extname(file).toLowerCase() === '.json'
        );


        // Extrai os emails dos nomes dos arquivos
        const emails = jsonFiles.map((file) => path.basename(file, '.json'));

        return emails;
    } catch (error) {
        console.error('Erro ao ler os arquivos:', error);
        return [];
    }
}

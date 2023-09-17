import axios from 'axios';
import saveDataToFile from '../utils/saveDataToFile';
import getEmailsFromJSONFiles from '../utils/getEmailsFromJSONFiles';
import deleteFile from '../utils/deleteFile';
import * as log from '../console-logger';
import readJsonFile from '../utils/readJsonFile';
import type UserInterface from '../interfaces/user.interface';
import type ResponseData from '../interfaces/response.interface';

export class AuthService {
    constructor(private readonly auth_folder: string) {}

    async login(email: string, password: string): Promise<ResponseData> {
        const data = JSON.stringify({
            email,
            password,
        });
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            headers: {
                'Content-Type': 'application/json',
            },
            data,
        };

        try {
            const response = await axios.post(
                'http://localhost:3000/api/auth/email/login',
                data,
                {
                    headers: config.headers,
                }
            );
            await saveDataToFile(
                `${this.auth_folder}/${email}.json`,
                response.data
            );

            return {
                error: false,
                response: response.data,
            };
        } catch (error: any) {
            return {
                error: true,
                response: error.response
                    ? error.response.data.errors.join('\n')
                    : error.message,
            };
        }
    }

    async logoutAccount(email: string) {
        try {
            void deleteFile(`${this.auth_folder}/${email}.json`);
        } catch (error) {
            log.error(
                'Não conseguimos deslogar dessa conta no momento volte novamente mais tarde'
            );
        }
    }

    async readUserData(emaiL: string) {
        const user = await readJsonFile<UserInterface>(
            `${this.auth_folder}/${emaiL}.json`
        );

        return user;
    }

    getAccounts() {
        return getEmailsFromJSONFiles(this.auth_folder);
    }
}

export default new AuthService('auth_tokens');

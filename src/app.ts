import figlet from 'figlet';
import * as dotenv from 'dotenv';
import * as log from './console-logger';
import AuthStream from './streams/auth';
import ActionsStream from './streams/actions';

dotenv.config({ path: '.env' });

async function main() {
    console.log(figlet.textSync('Zap Boom'));
    while (true) {
        const loging = await AuthStream();
        if (!loging) {
            log.error(
                'Aconteceu um erro ao tentar se autenticar, contate o suporte'
            );
        }
        if (loging?.error) {
            if (loging?.error_message) {
                log.error(loging.error_message);
            }
        }

        if (loging?.user) {
            await ActionsStream(loging?.user?.email);
        }
    }
}

main().catch(console.error);

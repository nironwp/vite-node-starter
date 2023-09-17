import type ResponseData from '../../interfaces/response.interface';
import authService from '../../services/auth.service';
import botService from '../../services/bot.service';

export default async function deleteBetDouble(
    email: string,
    strategieId: string
): Promise<ResponseData> {
    const userData = await authService.readUserData(email);

    if (!userData) {
        return {
            error: true,
            response: 'Não foi possivel encontrar o usuario',
        };
    }

    return await botService.removeStrategieDouble(userData.token, strategieId);
}

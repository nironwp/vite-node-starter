import serverService from '../../../services/server.service';

export default async function getLastResultsFromApiDouble(
    results: number[],
    botId: string,
    temporaryCode: string
) {
    const resultsFromApi = await serverService.getResultsDouble(
        botId,
        temporaryCode
    );

    if (!arraysAreEqual(results, resultsFromApi.response)) {
        return resultsFromApi;
    }

    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 1000);
    });
    return getLastResultsFromApiDouble(results, botId, temporaryCode);
}

function arraysAreEqual(arr1: number[], arr2: number[]) {
    if (arr1.length !== arr2.length) {
        return false; // Os arrays têm comprimentos diferentes, portanto não podem ser iguais
    }

    return arr1.every((element, index) => element === arr2[index]);
}

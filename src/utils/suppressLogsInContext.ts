export default async function suppressAllConsoleLogs(callback: any) {
    const originalConsole = { ...console }; // Cria uma cópia do console original

    // Substitui todas as funções do console por funções vazias
    console.log =
        console.info =
        console.error =
        console.warn =
        console.debug =
            () => {};

    try {
        // Chama o callback (nenhum log será exibido)
        await callback();
    } finally {
        // Independentemente de sucesso ou erro no callback, sempre restaura o console original
        Object.assign(console, originalConsole);
    }
}

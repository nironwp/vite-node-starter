export default function listToNumberedList(names: string[]) {
    const namesMaped = names.map((name, index) => {
        return `${index + 1} - ${name}`;
    });

    return namesMaped.join('\n');
}

import MuteStream from 'mute-stream';

export default function suppressAllOutput(callback: () => void): void {
    const msOut = new MuteStream();
    const msErr = new MuteStream();

    msOut.pipe(process.stdout);
    msErr.pipe(process.stderr);

    // Mute streams
    msOut.mute();
    msErr.mute();

    try {
        callback();
    } finally {
        // Unmute streams
        msOut.unmute();
        msErr.unmute();
    }
}

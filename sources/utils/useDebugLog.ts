import * as React from 'react';

export function useDebugLog(): [string[], (msg: string) => void] {
    const [logs, setLogs] = React.useState<string[]>([]);

    const log = (msg: string) => {
        setLogs([...logs, msg]);
    };

    return [logs, log];
}
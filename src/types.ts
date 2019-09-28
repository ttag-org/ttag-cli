export type Location = "file" | "full" | "never";

export type TtagOpts = {
    extract?: {
        location?: Location;
        output?: string;
    };
    defaultLang?: string;
    resolve?: { translations: string };
    discover?: string[];
    numberedExpressions?: boolean;
    sortByMsgid?: boolean;
    addComments?: boolean;
};

export type Progress = {
    text: string;
    start(text?: string | undefined): any;
    succeed(text?: string | undefined): any;
    warn(text?: string | undefined): any;
    fail(text?: string): any;
};

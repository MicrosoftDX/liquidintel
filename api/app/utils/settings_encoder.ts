

const arrayDelimiter = ';';

export function decodeSettingArray(setting: string): any[] {
    return (setting || '').split(arrayDelimiter);
}

export function encodeSettingArray(setting: any[]): string {
    return (setting || []).join(arrayDelimiter);
}
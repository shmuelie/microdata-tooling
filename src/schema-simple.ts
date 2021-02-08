interface ThingBase {
    "@type": string;
    [s: string]: Thing | null | undefined | Thing[];
}

export type Thing = ThingBase | string;
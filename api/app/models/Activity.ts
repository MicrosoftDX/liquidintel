
export interface Activity {
    SessionId: number,
    PourTime: Date,
    PourAmount: number,
    BeerName: string,
    Brewery?: string,
    BeerType?: string,
    ABV?: number,
    IBU?: number,
    BeerDescription?: string,
    UntappdId?: number,
    BeerImagePath?: string,
    PersonnelNumber: number,
    Alias?: string,
    FullName?: string,
    UntappdCheckinId?: number,
    UntappdBadgeName?: string,
    UntappdBadgeImageURL?: string
}
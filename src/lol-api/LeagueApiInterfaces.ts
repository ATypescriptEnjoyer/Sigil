export interface EventData {
    data: Session;
    eventType: "Create" | "Update" | "Delete";
    uri: string;
}

export interface ChampData {
    champion: string;
    role: string;
}

export interface LeagueDetails {
    "riotclient-auth-token": string;
    "riotclient-app-port": number;
    "remoting-auth-token": string;
    "app-port": number;
}

export interface Session {
    myTeam: MyTeam[];
    allowRerolling: boolean;
}

export interface MyTeam {
    assignedPosition: string;
    cellId: number;
    championId: number;
    championPickIntent: number;
    entitledFeatureType: string;
    selectedSkinId: number;
    spell1Id: number;
    spell2Id: number;
    summonerId: number;
    team: number;
    wardSkinId: number;
}

export interface CurrentSummoner {
    accountId: number;
    displayName: string;
    internalName: string;
    nameChangeFlag: boolean;
    percentCompleteForNextLevel: number;
    profileIconId: number;
    puuid: string;
    summonerId: number;
    summonerLevel: number;
    unnamed: boolean;
    xpSinceLastLevel: number;
    xpUntilNextLevel: number;
}

export interface ChampKey {
    id: string;
    key: number;
}

export interface ChampLoadout {
    trees: string[];
    perks: string[];
    shards: string[];
    spells: string[];
}

export interface RuneDetails {
    id: number;
    name: string;
}

export interface SummonerSpell {
    name: string;
    key: number;
}

export interface ApiError {
    errorCode: string;
    httpStatus: number;
    implementationDetails: object,
    message: string;
}
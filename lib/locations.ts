export type Location={key:string;name:string;lat:number;lon:number;tideStation:string;tideStationName:string};
export const LOCATIONS:Record<string,Location>={
westport:{key:"westport",name:"Westport",lat:41.1415,lon:-73.3579,tideStation:"8468191",tideStationName:"Saugatuck River, CT"},
norwalk:{key:"norwalk",name:"Norwalk",lat:41.1176,lon:-73.4079,tideStation:"8468448",tideStationName:"South Norwalk, CT"},
darien:{key:"darien",name:"Darien",lat:41.0773,lon:-73.4693,tideStation:"8468799",tideStationName:"Long Neck Point, CT"},
fairfield:{key:"fairfield",name:"Fairfield",lat:41.1412,lon:-73.2637,tideStation:"8467726",tideStationName:"Southport Harbor, CT"},
greenwich:{key:"greenwich",name:"Greenwich",lat:41.0262,lon:-73.6282,tideStation:"8469549",tideStationName:"Cos Cob Harbor, CT"}
};
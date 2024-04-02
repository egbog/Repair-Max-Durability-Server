import { DatabaseServer} from "@spt-aki/servers/DatabaseServer";
import { ITraderConfig } from "@spt-aki/models/spt/config/ITraderConfig";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { ProfileHelper } from "@spt-aki/helpers/ProfileHelper";
import { EventOutputHolder } from "@spt-aki/routers/EventOutputHolder";
import { IPmcData } from "@spt-aki/models/eft/common/IPmcData";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { ITraderAssort } from "@spt-aki/models/eft/common/tables/ITrader";
import { HashUtil } from "@spt-aki/utils/HashUtil";

export class Assort
{
    constructor(private logger: ILogger, private tables: IDatabaseTables, private hashUtil: HashUtil) {}

    public addToAssort(trader: string, itemId: string) 
    {
        let assort = this.tables.traders[trader].assort;
        let assortId = this.hashUtil.generate();

        let item = this.tables.templates.handbook.Items.find(i => i.Id === itemId);
        let price = item.Price * 1.3;
        let currency = "5449016a4bdc2d6f028b456f";

        let loyalLvl = 1;

        assort.items.push(
            {
                "_id": assortId,
                "_tpl": itemId,
                "parentId": "hideout",
                "slotId": "hideout",
                "upd": {
                    "BuyRestrictionMax": 5,
                    "BuyRestrictionCurrent": 0,
                    "StackObjectsCount": 5,
                    "RepairKit": {
                        "Resource": 5
                    }
                }
            }
        );

        assort.barter_scheme[assortId] =
            [
                [
                    {
                        "count": price,
                        "_tpl": currency
                    }
                ]
            ];

        assort.loyal_level_items[assortId] = loyalLvl;
    }
}

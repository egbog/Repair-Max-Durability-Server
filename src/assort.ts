import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { MaxRepairResource, Traders } from "../config/config.json";

export class AssortInjector
{
    constructor(private logger: ILogger, private tables: IDatabaseTables) {}

    public addToAssort(itemId: string)
    {
        let traderId;
        let count = 0;

        // get our traderids
        for (let id in this.tables.traders)
            traderId = this.tables.traders[id].base.nickname === Traders.name ? id : traderId;

        const assort = this.tables.traders[traderId].assort;
        const assortId = "db6e9955c9672e4fdd7e38ad";

        const item = this.tables.templates.handbook.Items.find(i => i.Id === itemId);
        const price = item.Price;
        const currency = "5449016a4bdc2d6f028b456f";

        assort.items.push(
            {
                "_id": assortId,
                "_tpl": itemId,
                "parentId": "hideout",
                "slotId": "hideout",
                "upd": {
                    "BuyRestrictionMax": Traders.buyLimit,
                    "BuyRestrictionCurrent": 0,
                    "StackObjectsCount": Traders.stock,
                    "RepairKit": {
                        "Resource": MaxRepairResource
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

        assort.loyal_level_items[assortId] = Traders.loyaltyLevel;

        count++;

        return {
            "count": count,
            "trader": Traders.name,
            "item": this.tables.templates.items[itemId]._props.Name
        };
    }
}

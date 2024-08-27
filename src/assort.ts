import { ILogger } from "@spt/models/spt/utils/ILogger";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { MaxRepairResource, Traders } from "../config/config.json";

export class AssortInjector {
    constructor(
        private logger: ILogger,
        private tables: IDatabaseTables,
    ) {}

    private id = {
        // our item id
        "itemId": "86afd148ac929e6eddc5e370",
        // pre generated id for assort
        "assortId": "db6e9955c9672e4fdd7e38ad",
        // hardcoded trader ids
        "traderIds": {
            Prapor: "54cb50c76803fa8b248b4571",
            Therapist: "54cb57776803fa99248b456e",
            Skier: "58330581ace78e27b8b10cee",
            Peacekeeper: "5935c25fb3acc3127c3d8cd9",
            Mechanic: "5a7c2eca46aef81a7ca2145d",
            Ragman: "5ac3b934156ae10c4430e83c",
            Jaeger: "5c0647fdd443bc2504c2d371",
        },
    };

    public addToAssort(traderInfo: typeof Traders) {
        let count = 0;
        const addedTraders = [];

        const item = this.tables.templates.handbook.Items.find((i) => i.Id === this.id.itemId);
        const price = item.Price;
        const currency = "5449016a4bdc2d6f028b456f"; //rub

        for (let t of traderInfo) {
            if (t.enabled) {
                const traderId = this.id.traderIds[t.name];
                const assort = this.tables.traders[traderId].assort;
                const assortId = this.id.assortId;

                assort.items.push({
                        "_id": assortId,
                        "_tpl": item.Id,
                        "parentId": "hideout",
                        "slotId": "hideout",
                        "upd": {
                            "BuyRestrictionMax": t.buyLimit,
                            "BuyRestrictionCurrent": 0,
                            "StackObjectsCount": t.stock,
                            "RepairKit": {
                                "Resource": MaxRepairResource,
                            },
                        },
                    });

                assort.barter_scheme[assortId] = [
                    [
                        {
                            "count": price,
                            "_tpl": currency,
                        },
                    ],
                ];

                assort.loyal_level_items[assortId] = t.loyaltyLevel;

                addedTraders.push(t);

                count++;
            }
        }

        return {
            "count" : count,
            "traders" : addedTraders,
        };
    }
}

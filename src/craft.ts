import { DatabaseServer} from "@spt-aki/servers/DatabaseServer";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { IHideoutProduction, Requirement } from "@spt-aki/models/eft/hideout/IHideoutProduction";
import { HashUtil } from "@spt-aki/utils/HashUtil";

export class CraftInjector
{
    constructor(private db: DatabaseServer, private hashUtil: HashUtil) {}

    createCraft = (itemId, requirements, productionTime) : IHideoutProduction => {
        return {
            _id: `${itemId}_craft`,
            areaType: 10, //workbench
            requirements: requirements,
            productionTime: productionTime,
            endProduct: itemId,
            continuous: false,
            count: 1,
            productionLimitCount: 1,
            isEncoded: false,
            locked: false,
            needFuelForAllProductionTime: false,
        };
    };

    public injectCraft()
    {
        let count = 0;
        const tables = this.db.getTables();

        let reqs : Requirement[] = [
            {
                "type": "Tool",
                "templateId": "544fb5454bdc2df8738b456a" // leatherman
            },
            {
                "type": "Item",
                "templateId": "5d1c819a86f774771b0acd6c", // weapon parts
                "isFunctional": false,
                "count": 1
            },
            {
                "type": "Area",
                "areaType": 10, // workbench
                "requiredLevel": 1
            }
        ];

        const productionId = "86afd148ac929e6eddc5e370";

        const productionItem = this.createCraft("86afd148ac929e6eddc5e370", reqs, 1);

        tables.hideout.production.push(productionItem);
        return ++count;
    }
}

import { DatabaseServer} from "@spt-aki/servers/DatabaseServer";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { IHideoutProduction, Requirement } from "@spt-aki/models/eft/hideout/IHideoutProduction";
import { CraftTime, Requirements } from "../config/config.json";

export class CraftInjector
{
    constructor(private logger: ILogger, private db: DatabaseServer) {}

    private createCraft(itemId: string, requirements: Requirement[], productionTime: number): IHideoutProduction
    {
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
    }

    public injectCraft()
    {
        let count = 0;
        const tables = this.db.getTables();

        let reqs: Requirement[] = [];
        for (let a of Requirements)
            reqs.push(a);

        const itemId = "86afd148ac929e6eddc5e370";
        const productionItem = this.createCraft(itemId, reqs, CraftTime);
        tables.hideout.production.push(productionItem);

        return ++count;
    }
}

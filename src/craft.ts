import { DatabaseService } from "@spt/services/DatabaseService";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { IHideoutProduction, IRequirement } from "@spt/models/eft/hideout/IHideoutProduction";
import { CraftTime, Requirements } from "../config/config.json";

export class CraftInjector {
    constructor(
        private db: DatabaseService,
    ) {}

    private createCraft(itemId: string, craftId: string, requirements: IRequirement[], productionTime: number): IHideoutProduction {
        return {
            _id: craftId,
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
            isCodeProduction: false,
        };
    }

    public injectCraft(): number {
        let count = 0;
        const tables = this.db.getTables();

        const reqs: IRequirement[] = [];
        for (let a of Requirements) reqs.push(a);

        const itemId = "86afd148ac929e6eddc5e370";
        const craftId = "6747a15d68e0b74658000001";
        const productionItem = this.createCraft(itemId, craftId, reqs, CraftTime);
        tables.hideout.production.recipes.push(productionItem);

        return ++count;
    }
}

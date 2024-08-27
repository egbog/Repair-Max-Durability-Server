import { DependencyContainer } from "tsyringe";
import { DatabaseService } from "@spt/services/DatabaseService";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { IPostSptLoadMod } from "@spt/models/external/IPostSptLoadMod";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { CustomItemService } from "@spt/services/mod/CustomItemService";
import { NewItemFromCloneDetails } from "@spt/models/spt/mod/NewItemDetails";
import { DynamicRouterModService } from "@spt/services/mod/dynamicRouter/DynamicRouterModService";
import { JsonUtil } from "@spt/utils/JsonUtil";
import { PreSptModLoader } from "@spt/loaders/PreSptModLoader";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ProfileHelper } from "@spt/helpers/ProfileHelper";

import { Repair } from "./repair";
import { AssortInjector } from "./assort";
import { CraftInjector } from "./craft";
import { Price, MaxRepairResource, Traders } from "../config/config.json";

//import * as path from "path";
//import { HashUtil } from "@spt/utils/HashUtil";

class Mod implements IPreSptLoadMod, IPostDBLoadMod, IPostSptLoadMod {
    private path: { resolve: (arg0: string) => any; };
    private modLoader: PreSptModLoader;

    public preSptLoad(container: DependencyContainer): void {
        //const preSptModLoader = container.resolve<PreSptModLoader>("PreSptModLoader");
        const router = container.resolve<DynamicRouterModService>("DynamicRouterModService");
        this.path = require("path");

        router.registerDynamicRouter(
            "checkDragged",
            [
                {
                    url: "/MaxDura/CheckDragged",
                    action: async (url, info, sessionId) => {
                        const logger = container.resolve<ILogger>("WinstonLogger");
                        const jsonUtil = container.resolve<JsonUtil>("JsonUtil");
                        const profileHelper = container.resolve<ProfileHelper>("ProfileHelper");
                        const pmcData = profileHelper.getPmcProfile(sessionId);

                        const repairInstance = new Repair(logger, jsonUtil, pmcData, info);

                        return jsonUtil.serialize(repairInstance.ambeeb());
                    },
                },
            ],
            "MaxDura",
        );
    }

    public postDBLoad(container: DependencyContainer): void {
        const customItem = container.resolve<CustomItemService>("CustomItemService");
        const logger = container.resolve<ILogger>("WinstonLogger");
        const db = container.resolve<DatabaseService>("DatabaseService");
        const tables = db.getTables();
        //const hashUtil = container.resolve<HashUtil>("HashUtil");

        const maxRepairKit: NewItemFromCloneDetails = {
            itemTplToClone: "5910968f86f77425cf569c32", //5910968f86f77425cf569c32 weaprepairkit
            overrideProperties: {
                "Name": "Spare firearm parts",
                "ShortName": "Spare firearm parts",
                "Description":
                    "Spare parts such as bolt carrier groups, firing pins and other common wear items. Enough to make approximately 5 repairs.",
                "Weight": 1,
                "MaxRepairResource": MaxRepairResource,
                "Height": 2,
                "Width": 2,
                "TargetItemFilter": ["5422acb9af1c889c16000029"],
            },
            parentId: "616eb7aea207f41933308f46",
            newId: "86afd148ac929e6eddc5e370",
            fleaPriceRoubles: Price,
            handbookPriceRoubles: Price,
            handbookParentId: "5b47574386f77428ca22b345",
            locales: {
                "en": {
                    name: "Spare firearm parts",
                    shortName: "Spare firearm parts",
                    description: 
                        "Spare parts such as bolt carrier groups, firing pins and other common wear items. Enough to make about 5 repairs.",
                },
            },
        };

        customItem.createItemFromClone(maxRepairKit);

        // trader assort
        const assortInstance = new AssortInjector(logger, tables);
        const assortResult = assortInstance.addToAssort(Traders);
        if (assortResult.count > 0)
            for (let i of assortResult.traders) logger.debug(`[MaxDura]: Added trade to ${i.name}`);

        // hideout crafts
        const craftInstance = new CraftInjector(logger, db);
        const injectedCount = craftInstance.injectCraft();
        if (injectedCount > 0) logger.debug(`[MaxDura]: (${injectedCount}) crafts injected into database`);
    }

    public postSptLoad(container: DependencyContainer): void {
        this.modLoader = container.resolve<PreSptModLoader>("PreSptModLoader");
    }
}

module.exports = { mod: new Mod() };

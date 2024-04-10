import { DependencyContainer } from "tsyringe";
import { DatabaseServer} from "@spt-aki/servers/DatabaseServer";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { CustomItemService } from "@spt-aki/services/mod/CustomItemService";
import { NewItemFromCloneDetails } from "@spt-aki/models/spt/mod/NewItemDetails";
import { DynamicRouterModService } from "@spt-aki/services/mod/dynamicRouter/DynamicRouterModService"
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { PreAkiModLoader } from "@spt-aki/loaders/PreAkiModLoader";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { ProfileHelper } from "@spt-aki/helpers/ProfileHelper";
import { EventOutputHolder } from "@spt-aki/routers/EventOutputHolder";

import { Repair } from "./repair";
import { AssortInjector } from "./assort";
import { CraftInjector } from "./craft";

import * as path from "path";
import { HashUtil } from "@spt-aki/utils/HashUtil";

class Mod implements IPreAkiLoadMod, IPostDBLoadMod
{
    private path: { resolve: (arg0: string) => any; };
    private modLoader: PreAkiModLoader;

    public preAkiLoad(container: DependencyContainer): void 
    {
        const preAkiModLoader = container.resolve<PreAkiModLoader>("PreAkiModLoader");
        const router = container.resolve<DynamicRouterModService>("DynamicRouterModService");
        this.path = require("path");

        router.registerDynamicRouter(
            "checkDragged",
            [
                {
                    url: "/MaxDura/CheckDragged",
                    action: (url, info, sessionId, output) => {
                        const logger = container.resolve<ILogger>("WinstonLogger");
                        const jsonUtil = container.resolve<JsonUtil>("JsonUtil");
                        const profileHelper = container.resolve<ProfileHelper>("ProfileHelper");
                        const pmcData = profileHelper.getPmcProfile(sessionId);

                        const repairInstance = new Repair(logger, jsonUtil, pmcData, info);

                        return jsonUtil.serialize(repairInstance.ambeeb());
                    }
                }
            ],
            "MaxDura"
        )
    }

    public postDBLoad(container: DependencyContainer): void 
    {
        const CustomItem = container.resolve<CustomItemService>("CustomItemService");
        const logger = container.resolve<ILogger>("WinstonLogger");
        const db = container.resolve<DatabaseServer>("DatabaseServer");
        const tables = db.getTables();
        const hashUtil = container.resolve<HashUtil>("HashUtil");
        
        const MaxRepairKit: NewItemFromCloneDetails = {
            itemTplToClone: "5910968f86f77425cf569c32", //5910968f86f77425cf569c32 weaprepairkit
            overrideProperties: {
                "Name": "Spare Firearm Parts",
                "ShortName": "Spare Firearm Parts",
                "Description": "Spare parts such as bolt carrier groups, firing pins and other common wear items. Enough to make approximately 5 repairs.",
                "Weight": 1,
                "MaxRepairResource": 5,
                "Height": 2,
                "Width": 2,
                "TargetItemFilter": [
                    "5422acb9af1c889c16000029"
                ]
            },
            parentId: "616eb7aea207f41933308f46",
            newId: "86afd148ac929e6eddc5e370",
            fleaPriceRoubles: 67500,
            handbookPriceRoubles: 67500,
            handbookParentId: "5b47574386f77428ca22b345",
            locales: {
                "en": {
                    name: "Spare Firearm Parts",
                    shortName: "Spare Firearm Parts",
                    description: "Spare parts such as bolt carrier groups, firing pins and other common wear items. Enough to make approximately 5 repairs."
                }
            }
        }

        CustomItem.createItemFromClone(MaxRepairKit);

        // trader assort
        const assortInstance = new AssortInjector(logger, tables);
        const assortCount = assortInstance.addToAssort("mechanic", "86afd148ac929e6eddc5e370");
        if (assortCount.count > 0) {
            logger.debug(`[MaxDura]: Added ${assortCount.item} trade to ${assortCount.trader} assort`);
        }

        // hideout crafts
        const craftInstance = new CraftInjector(logger, db);
        const injectedCount = craftInstance.injectCraft();
        if (injectedCount > 0) {
            logger.debug(`[MaxDura]: (${injectedCount}) crafts injected into database`);
        }
    }

    public postAkiLoad(container: DependencyContainer): void 
    {
        this.modLoader = container.resolve<PreAkiModLoader>("PreAkiModLoader");
    }
}

module.exports = { mod: new Mod() }

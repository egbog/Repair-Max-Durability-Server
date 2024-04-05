import { DatabaseServer} from "@spt-aki/servers/DatabaseServer";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { ProfileHelper } from "@spt-aki/helpers/ProfileHelper";
import { EventOutputHolder } from "@spt-aki/routers/EventOutputHolder";
import { IPmcData } from "@spt-aki/models/eft/common/IPmcData";

export class Repair
{
    constructor(private logger: ILogger, private db: DatabaseServer, private jsonUtil: JsonUtil, private eventOutputHolder: EventOutputHolder, 
                private profileHelper: ProfileHelper, private pmcData: IPmcData, private info: any, private sessionId: string){}

    public ambeeb()
    {
        const id = this.info.id;
        const kitId = this.info.repairKitId;
        const itemToRepair = this.pmcData.Inventory.items.find((x: { _id: string; }) => x._id === id);
        const repairKit = this.pmcData.Inventory.items.find((x: { _id: string; }) => x._id === kitId);

        const itemMaxDurability = 100;
        const itemCurrentDurability = this.jsonUtil.clone(itemToRepair.upd.Repairable.Durability);
        const itemCurrentMaxDurability = this.jsonUtil.clone(itemToRepair.upd.Repairable.MaxDurability);

        const amountToRepair = itemMaxDurability - itemCurrentMaxDurability;
        const newCurrentMaxDurability = itemCurrentMaxDurability + amountToRepair;

        itemToRepair.upd.Repairable = { Durability: itemCurrentDurability, MaxDurability: newCurrentMaxDurability };

        // check if repair kit was crafted
        // for some reason crafted kits don't contain a "RepairKit" component in upd
        // so just workaround add it ourselves
        if (repairKit.upd.SpawnedInSession == true && repairKit.upd.RepairKit == null) {
            repairKit.upd.RepairKit = {
                "Resource": 5
            };
        }

        repairKit.upd.RepairKit.Resource--;

        if (repairKit.upd.RepairKit.Resource <= 0)
        {
            let count = this.pmcData.Inventory.items.findIndex((x: { _id: string; }) => x._id === kitId);
            
            //this.pmcData.Inventory.items.splice(count, 1);
            // it appears that calling TraderControllerClass.DestroyItem() clientside will trigger /client/game/profile/items/moving
            // event: Remove
            // and delete our item from the profile for us
        }

        // organize our items into a parent "Items" so we can use JToken.First and JToken.Next client-side
        let out = { "Items" : [itemToRepair, repairKit] };

        return out;
    }
}

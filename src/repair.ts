import { DatabaseServer} from "@spt-aki/servers/DatabaseServer";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { ProfileHelper } from "@spt-aki/helpers/ProfileHelper";
import { EventOutputHolder } from "@spt-aki/routers/EventOutputHolder";
import { IPmcData } from "@spt-aki/models/eft/common/IPmcData";

export class Repair
{
    constructor(private logger: ILogger, private jsonUtil: JsonUtil, private pmcData: IPmcData, private info: any){}

    public ambeeb()
    {
        // get values from our client
        const id = this.info.itemId;
        const kitId = this.info.repairKitId;

        // lookup
        const itemToRepair = this.pmcData.Inventory.items.find((x: { _id: string; }) => x._id === id);
        const repairKit = this.pmcData.Inventory.items.find((x: { _id: string; }) => x._id === kitId);

        const itemDurability = 100;
        const itemMaxDurability = itemDurability;
        const itemCurrentMaxDurability = this.jsonUtil.clone(itemToRepair.upd.Repairable.MaxDurability);

        // set new values
        const amountToRepair = itemMaxDurability - itemCurrentMaxDurability;
        const newCurrentMaxDurability = itemCurrentMaxDurability + amountToRepair;
        const newCurrentDurability = newCurrentMaxDurability;

        // update our item
        itemToRepair.upd.Repairable = { 
            Durability: newCurrentDurability, 
            MaxDurability: newCurrentMaxDurability 
        };

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

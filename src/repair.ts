import { JsonUtil } from "@spt/utils/JsonUtil";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { IPmcData } from "@spt/models/eft/common/IPmcData";
import { MaxRepairResource } from "../config/config.json";

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

        const itemMaxDurability = 100;
        const itemCurrentMaxDurability = itemToRepair.upd.Repairable.MaxDurability;

        // set new values
        const amountToRepair = itemMaxDurability - itemCurrentMaxDurability;
        const newCurrentMaxDurability = itemCurrentMaxDurability + amountToRepair;

        // update our item
        itemToRepair.upd.Repairable = { 
            Durability: newCurrentMaxDurability, 
            MaxDurability: newCurrentMaxDurability 
        };

        // check if repair kit was crafted
        // for some reason crafted kits don't contain a "RepairKit" component in upd
        // so just workaround add it ourselves
        if (repairKit.upd.RepairKit == null) {
            repairKit.upd.RepairKit = {
                "Resource": MaxRepairResource
            };
        }

        repairKit.upd.RepairKit.Resource--;

        if (repairKit.upd.RepairKit.Resource <= 0)
        {
            let count = this.pmcData.Inventory.items.findIndex((x: { _id: string; }) => x._id === kitId);
        }
        //this.pmcData.Inventory.items.splice(count, 1);
        // it appears that calling TraderControllerClass.DestroyItem() clientside will trigger /client/game/profile/items/moving
        // event: Remove
        // and delete our item from the profile for us

        // organize our items into a parent "Items" so we can use JToken.First and JToken.Next client-side
        let out = { "Items" : [itemToRepair, repairKit] };

        return out;
    }
}

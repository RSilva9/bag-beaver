import { useEffect, useState } from "react"
import { getCampaigns, on } from "../../network/socket"
import { type Campaign } from "../../../../shared/src/types"

export default function CampaignDashboard(){
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    useEffect(() => {
        const off = on("CAMPAIGN_LIST", (data) => setCampaigns(data.campaigns));
        getCampaigns();

        return () => {
            off();
        };
    }, []);

    useEffect(()=> console.log(campaigns), [campaigns])

    return(
        <div>
            {
                campaigns &&
                campaigns.map(c => (
                    <div>
                        {c.code}
                    </div>
                ))
            }
        </div>
    )
}
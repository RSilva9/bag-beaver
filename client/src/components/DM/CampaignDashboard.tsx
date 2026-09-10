import { useEffect } from "react"
import { useAppStore } from "../../network/store"
import { Link } from "react-router-dom";

export default function CampaignDashboard(){
    const campaigns = useAppStore(s => s.campaigns);
    const getCampaigns = useAppStore(s => s.getCampaigns);

    useEffect(()=> {
        getCampaigns();
    }, []);

    return(
        <div>
            <Link to={"/create-campaign"}>Create new campaign</Link>
            <div className="flex gap-3">
                {
                    campaigns.length > 0 &&
                    campaigns.map(c => (
                        <div key={c.code} className="flex flex-col w-[300px] border text-center">
                            <p>{c.name} ({c.code})</p>
                            <hr/>
                            {
                                c.players.map(p => (
                                    <p key={p.id}>{p.name}</p>
                                ))
                            }
                            <Link to={`/campaign/${c.code}`} 
                                className="bg-black border m-3 text-white cursor-pointer"
                            >
                                Open campaign
                            </Link>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
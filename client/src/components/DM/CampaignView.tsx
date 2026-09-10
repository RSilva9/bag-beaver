import { useParams } from "react-router-dom"

export default function CampaignView(){
    const { campaignCode } = useParams();

    return(
        <div>
            <p>{campaignCode}</p>
        </div>
    )
}
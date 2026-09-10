import { useState } from "react"
import { useAppStore } from "../../network/store";

export default function CampaignCreator(){
    const [name, setName] = useState("");
    const createCampaign = useAppStore(s => s.createCampaign);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if(!name.trim()) return;
        createCampaign(name);
        setName("");
        window.location.href = "/campaign-dashboard"
    }     
    return(
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Campaign name"
                />
                <button type="submit" className="border cursor-pointer">Create</button>
            </form>
        </div>
    )
}
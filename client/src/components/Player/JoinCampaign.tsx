import { useState } from "react";
import { joinCampaign } from "../../network/socket";

export default function JoinCampaign(){
    const [code, setCode] = useState("");
    const [name, setName] = useState("");

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (!code) return;
        
        joinCampaign(code, name);
        setCode("");
        setName("");
    }

    return(
        <div>
            <form onSubmit={handleSubmit} className="flex flex-col w-50 mx-auto mt-20 gap-5">
                <input
                    type="text"
                    className="border-solid border-1"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="Campaign code"
                />
                <input
                    type="text"
                    className="border-solid border-1"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Player name"
                />
                <button type="submit" className="p-2 border-solid border-1 cursor-pointer text-center">Join</button>
            </form>
        </div>
    )
}
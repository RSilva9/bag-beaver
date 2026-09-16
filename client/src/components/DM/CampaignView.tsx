import { useParams, useSearchParams } from "react-router-dom"
import ItemList from "../Shared/ItemList";
import type { Column } from "../../types";
import { useEffect, useState } from "react";
import { useAppStore } from "../../network/store";

type Item = { id: number; name: string; note: string; }

export default function CampaignView(){
    const { campaignCode } = useParams();
    const [searchParams] = useSearchParams();
    const dmSecret = searchParams.get("dm");

    const dmCampaign = useAppStore(s => s.dmCampaign);
    const joinCampaignAsDM = useAppStore(s => s.joinCampaignAsDM);

    const [modalItemId, setModalItemId] = useState<number | null>(null);
    const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);

    useEffect(() => {
        if (campaignCode && dmSecret) {
            joinCampaignAsDM(campaignCode, dmSecret);
        }
    }, [campaignCode, dmSecret]);

    if (!dmCampaign) {
        return <div>Loading...</div>;
    }
    
    const items = [
        { id: 1, name: "Sword", note: "Dropped in the Colosseum" },
        { id: 2, name: "Shield", note: "Dropped in the Colosseum" },
        { id: 3, name: "Wand", note: "Dropped in the lake" },
        { id: 4, name: "Super giant ultra omega magic horn", note: "Dropped in the river by accident. Fell from the boat the party was travelling on." },
    ];

    const columns: Column<Item>[] = [
        { key: "name", title: "Item", sizePercentage: 30 },
        { key: "note", title: "Note", sizePercentage: 52 },
        {
            key: "id",
            title: "Actions",
            sizePercentage: 18,
            render: (item: Item) => (
            <div className="flex items-center gap-2 justify-end">
                <button className="w-6 h-6 rounded-none bg-neutral-800 text-white text-[10px] hover:bg-neutral-700 transition-colors"
                    onClick={() => setModalItemId(item.id)}
                >
                A
                </button>
                <button className="w-6 h-6 rounded-none bg-neutral-200 text-neutral-800 text-[10px] hover:bg-neutral-300 transition-colors">
                B
                </button>
            </div>
            ),
        }
    ];

    return(
        <div className="m-3 flex flex-col gap-2">
            <div className="flex bg-black w-full h-[50px] text-white">
                <div className="w-3/4 flex items-center p-5">
                    {dmCampaign.name}
                </div>
                <div className="w-1/4 flex items-center p-5">
                    CONFIGURACIÓN
                </div>
            </div>
            <div className="grid grid-cols-4 bg-gray-700 h-[550px] w-full">
                {
                    [1,2,3,4,5,6,7,8].map(n => (
                        <div className="my-auto text-center" key={n}>
                            <img />
                            <h4 className="text-[50px]">{n}</h4>
                        </div>
                    ))
                }
            </div>
            <div className="flex flex-col bg-olive-700 h-[550px] w-full p-5">
                <ItemList list={items} columns={columns} />
            </div>

            {
                modalItemId !== null &&

                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white p-4 w-72">
                        <p className="text-sm mb-2">Select a player</p>
                        <select
                        className="w-full border border-neutral-300 p-2 text-sm mb-3"
                        value={selectedPlayer ?? ""}
                        onChange={(e) => setSelectedPlayer(Number(e.target.value))}
                        >
                        <option value="" disabled>
                            Select...
                        </option>
                        {dmCampaign!.players.map((p) => (
                            <option key={p.id} value={p.id}>
                            {p.name}
                            </option>
                        ))}
                        </select>
                        <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setModalItemId(null)}
                            className="px-3 py-1 text-sm bg-neutral-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                console.log("Sent", { archivoId: modalItemId, selectedPlayer });
                                setModalItemId(null);
                            }}
                            className="px-3 py-1 text-sm bg-neutral-800 text-white"
                        >
                            Send
                        </button>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}
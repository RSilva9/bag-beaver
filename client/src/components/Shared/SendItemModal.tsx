// import { useState } from "react";

// export default function SendItemModal({ players }: { players: { id: number, name: string }[]}){
//     const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);

//     return(
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
//             <div className="bg-white p-4 w-72">
//                 <p className="text-sm mb-2">Elegí un jugador</p>
//                 <select
//                 className="w-full border border-neutral-300 p-2 text-sm mb-3"
//                 value={selectedPlayer ?? ""}
//                 onChange={(e) => setSelectedPlayer(Number(e.target.value))}
//                 >
//                 <option value="" disabled>
//                     Select...
//                 </option>
//                 {players.map((p) => (
//                     <option key={p.id} value={p.id}>
//                     {p.name}
//                     </option>
//                 ))}
//                 </select>
//                 <div className="flex justify-end gap-2">
//                 <button
//                     onClick={() => setModalItemId(null)}
//                     className="px-3 py-1 text-sm bg-neutral-200"
//                 >
//                     Cancel
//                 </button>
//                 <button
//                     onClick={() => {
//                         console.log("Sent", { archivoId: modalItemId, selectedPlayer });
//                         setModalItemId(null);
//                     }}
//                     className="px-3 py-1 text-sm bg-neutral-800 text-white"
//                 >
//                     Send
//                 </button>
//                 </div>
//             </div>
//         </div>
//     )
// }
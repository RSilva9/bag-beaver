import type { Column } from "../../types";

export default function ItemList<T extends { id: string | number }>
({list, columns}: { list: T[]; columns: Column<T>[] }) {
    return (
        <table className="w-full table-fixed border-collapse text-sm">
            <colgroup>
                {
                    columns.map(c => (
                        <col key={String(c.key)} style={{ width: `${c.sizePercentage}%`}}/>
                    ))
                }
            </colgroup>
            <thead>
                <tr className="text-xs text-neutral-500 border-b border-neutral-300">
                    {
                        columns.map(c => (
                            <th key={String(c.key)} className="text-left font-normal py-2">
                                {c.title}
                            </th>
                        ))
                    }
                </tr>
            </thead>
            <tbody>
            {list.map((item) => (
                <tr key={item.id} className="border-b border-neutral-100">
                    {columns.map(c => (
                        <td key={String(c.key)} className="py-2 pr-3">
                            {
                                c.render ? (
                                    c.render(item)
                                ) : (
                                    <div className="overflow-x-auto whitespace-nowrap text-neutral-800">
                                        {String(item[c.key] ?? "")}
                                    </div>
                                )
                            }
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    );
}
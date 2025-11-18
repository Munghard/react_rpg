export interface Item {
    name: string;
    bonusAttack?: number;
    bonusDefense?: number;
}

export const Items = [
    { name: "Sharp Stone", bonusAttack: 2 },
    { name: "Lucky Coin", bonusDefense: 1 },
    { name: "Amulet of Might", bonusAttack: 1, bonusDefense: 1 },
    { name: "Ring of Swiftness", bonusAttack: 1 },
    { name: "Pendant of Protection", bonusDefense: 2 },
    { name: "Talisman of Strength", bonusAttack: 3 },
    { name: "Charm of Fortitude", bonusDefense: 3 },
    { name: "Band of Balance", bonusAttack: 1, bonusDefense: 1 },
    { name: "Orb of Precision", bonusAttack: 2 },
    { name: "Emblem of Guarding", bonusDefense: 2 }
];

const ItemList = () => {

    return (
        <>
            <div className="flex flex-col gap-2 items-center w-full m-2">
                <h1 className="text-5xl">Relics</h1>
                <table className="table border-3 border-zinc-900 text-center w-full ">
                    <thead className="bg-zinc-700">
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Bonus atk</th>
                            <th>Bonus def</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Items.map((item, index) =>
                            <tr key={index} className="bg-zinc-800 border-3 border-zinc-900">
                                <td>#{index + 1}</td>
                                <td>{item.name} </td>
                                <td>{item.bonusAttack ?? "-"}</td>
                                <td>{item.bonusDefense ?? "-"} </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default ItemList;
import { MouseEventHandler } from "react";
import { Item, Items } from "./Items"

interface CharmAcquireProps {
    newCharmId: number;
    oldCharmId: number | null;
    swap: (id: number) => Promise<void>;
    skip: () => void;
}

const CharmAcquire = ({ newCharmId, oldCharmId, swap, skip }: CharmAcquireProps) => {

    const newCharm: Item | null = Items[newCharmId] ?? null;

    const oldCharm: Item | null = oldCharmId != null ? Items[oldCharmId] : null;

    if (!newCharm) return;

    return (
        <>
            <div className="flex flex-col w-fit h-fit items-center panel">
                <label>New charm: </label>
                <p className="text-amber-300">{newCharm.name} Atk:{newCharm.bonusAttack ?? 0} Def:{newCharm.bonusDefense ?? 0}</p>
                {oldCharm &&
                    <>
                        <label>Equiped charm: </label>
                        <p className="text-blue-300">{oldCharm.name} Atk:{oldCharm.bonusAttack ?? 0} Def:{oldCharm.bonusDefense ?? 0}</p>
                    </>
                }
                <div className="flex gap-2 mt-5">
                    <button onClick={() => swap(newCharmId)} className="button button-warning">Swap</button>
                    <button onClick={skip} className="button button-primary">Skip</button>
                </div>
            </div>
        </>
    )
}
export default CharmAcquire;
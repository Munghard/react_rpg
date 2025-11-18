import { useContext, useEffect, useState } from "react";
import CharmAcquire from "./CharmAcquire";
import { HeroData } from "./Hero";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { UserContext } from "../Contexts/UserContext";
import { Items } from "./Items";

interface RewardProps {
    victory: boolean;
    gold: number;
    xp: number;
    rolledCharm?: number | null;
    playerHero: HeroData;
    setShowRewardPanel: (bool: boolean) => void;
    charmAcquireShow: boolean;
    setCharmAcquireShow: (bool: boolean) => void;
}

export function RollRelic(setRolledCharm: (id: number) => void, setCharmAcquireShow: (bool: boolean) => void, relicChance: number) {
    const rollCharmGet = Math.random();
    if (rollCharmGet > relicChance) {
        const rolledId = Math.floor(Math.random() * Items.length);
        setRolledCharm(rolledId);
        setCharmAcquireShow(true);
    }
}

const RewardPanel = (props: RewardProps) => {

    const context = useContext(UserContext);
    const userId = context?.userId;
    if (!userId) return (<p>login to see content.</p>);



    const handleSwapCharm = async (id: number) => {
        const heroRef = doc(db, "heroes", userId);
        await updateDoc(heroRef, { charmId: id });
        props.setCharmAcquireShow(false)
        console.log("charm swapped");
    }

    useEffect(() => {
        const giveReward = async () => {
            if (props.victory) {
                props.playerHero.gold += props.gold;
                props.playerHero.xp += props.xp;
            }
            else {
                props.playerHero.gold -= props.gold;
                // should you still gain xp when you lose?
                // props.playerHero.xp += props.xp;
            }

            //update db
            const heroRef = doc(db, "heroes", userId);
            await updateDoc(heroRef, { gold: props.playerHero.gold, xp: props.playerHero.xp });
        }
        giveReward();
    }, [])

    return (
        <div className="inset-0 bg-black/50 absolute w-full h-full backdrop-blur-sm">
            <div className="flex flex-col items-center panel absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <h1 className="text-2xl">{props.victory ? "📯 Victory 📯" : "☠️ Defeat ☠️"}</h1>
                <p>{props.victory ? "You are awarded:" : "You have lost:"}</p>
                <span>{props.victory ? `✨ Xp:${props.xp.toFixed(1)},` : ""} 🪙 Gold:{props.gold.toFixed(1)}</span>
                <button className="button button-success" onClick={() => props.setShowRewardPanel(false)}>Accept</button>
                {(props.charmAcquireShow && props.rolledCharm) &&
                    <>
                        <div className="flex flex-col items-center panel-secondary">
                            <h1 className="text-xl">Looted new charm!</h1>
                            <CharmAcquire newCharmId={props.rolledCharm} oldCharmId={props.playerHero.charmId || null} skip={() => {
                                props.setCharmAcquireShow(false);
                            }}
                                swap={async (id) => { await handleSwapCharm(id); }}
                            ></CharmAcquire>
                        </div>
                    </>
                }
            </div>
        </div>
    )

}
export default RewardPanel;
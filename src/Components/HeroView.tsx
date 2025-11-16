import { useState } from "react";
import { HeroData } from "./Hero";
import { Items } from "./Items";
import ProgressBar from "./ProgressBar";

type HeroProps = {
    heroData: HeroData | null;
    currentHp?: number | null;
};

const HeroView = ({ heroData, currentHp }: HeroProps) => {

    const [showStats, setShowStats] = useState<boolean>(false);

    return (
        heroData &&
        <div className="flex flex-col w-fit h-fit items-center panel">
            <h1 className="text-xl">{heroData.name}</h1>
            <img className="h-24 w-24 object-cover border-3 border-zinc-900" src={heroData.avatarUrl}></img>
            {currentHp && <ProgressBar progress={currentHp / heroData.hp}></ProgressBar>}

            <button className="button button-secondary" onClick={() => setShowStats(!showStats)}>Stats</button>
            {showStats &&
                <div className="flex flex-col w-full p-2 bg-zinc-800 border-3 border-zinc-900  max-w-40 ">
                    <p className="text-md text-zinc-400">🔮 Level: {heroData.level}</p>
                    <p className="text-md text-zinc-400">✨ Xp: {heroData.xp.toFixed(1)}</p>
                    <p className="text-md text-zinc-400">🪙 Gold: {heroData.gold.toFixed(1)}</p>
                    <p className="text-md text-zinc-400">🩸 Hp: {heroData.hp?.toFixed(1)}</p>
                    <p className="text-md text-zinc-400">⚔️ Atk: {heroData.attack?.toFixed(1)} + {Items[heroData.charmId ?? -1]?.bonusAttack}</p>
                    <p className="text-md text-zinc-400">🛡️ Def: {heroData.defense?.toFixed(1)} + {Items[heroData.charmId ?? -1]?.bonusDefense}</p>
                    <p className="text-md text-zinc-400">💍 Relic: {Items[heroData.charmId ?? -1]?.name ?? "None"}</p>
                </div>}
        </div>
    )
}
export default HeroView;
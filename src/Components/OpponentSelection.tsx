import { useState } from "react";
import Combat, { CombatHero } from "./Combat";
import { HeroData } from "./Hero";
import { OtherHeros } from "./Enemies";
import RewardPanel from "./RewardPanel";

const OpponentSelection = () => {

    const [otherCombatHero, setOtherCombatHero] = useState<CombatHero | null>(null);
    const [showRewardPanel, setShowRewardPanel] = useState(false);
    const [rewardPanelProps, setRewardPanelProps] = useState<any>(null);

    const selectOtherHero = (hero: HeroData) => {
        const combatHero: CombatHero = {
            hero: hero,
            currentHp: hero.hp,
        }
        setOtherCombatHero(combatHero);
    }

    // Callback for Combat to trigger RewardPanel in OpponentSelection
    const handleShowRewardPanel = (props: any) => {
        setRewardPanelProps(props);
        setShowRewardPanel(true);
    };

    return (
        <>
            {!otherCombatHero &&
                <div className="flex flex-col gap-2 items-center">
                    <h1 className="text-2xl">Select opponent</h1>
                    <div className="flex gap-2 flex-wrap">
                        {OtherHeros.sort((a, b) => a.level - b.level).map(oh =>
                            <div key={oh.name} onClick={() => selectOtherHero(oh)} className="panel cursor-pointer  max-w-30">
                                <img className="w-24 h-24 object-cover border-3 border-zinc-950" src={oh.avatarUrl}></img>
                                <h1>{oh.name}</h1>
                                <h1>Level: {oh.level}</h1>
                            </div>
                        )}
                    </div>
                </div>
            }
            {otherCombatHero &&
                <Combat
                    canFlee={true}
                    otherCombatHero={otherCombatHero}
                    setOtherCombatHero={setOtherCombatHero}
                    setResult={(e) => setOtherCombatHero(e ? null : otherCombatHero)}
                    showRewardPanel={handleShowRewardPanel}
                />
            }
            {showRewardPanel && rewardPanelProps &&
                <RewardPanel
                    {...rewardPanelProps}
                    setShowRewardPanel={(v: boolean) => setShowRewardPanel(v)}
                />
            }
        </>
    )
}

export default OpponentSelection;
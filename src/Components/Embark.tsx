import { useContext, useEffect, useState } from "react";
import { UserContext } from "../Contexts/UserContext";
import ProgressBar from "./ProgressBar";
import { doc, increment, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { areas } from "../Areas";
import RewardPanel, { RollRelic } from "./RewardPanel";
import Hero, { fetchHero, HeroData } from "./Hero";
import Maze from "./Maze";

type Reward = {
    gold: number;
    xp: number;
}

const Embark = () => {


    const context = useContext(UserContext);
    const userId = context?.userId;

    const [hero, setHero] = useState<HeroData | null>(null);

    const [progress, setProgress] = useState<number>(0);
    const [embarked, setEmbarked] = useState<boolean>(false);
    const [selectedArea, setSelectedArea] = useState<number>(0);
    const [reward, setReward] = useState<Reward | null>(null);
    const [showResult, setShowResult] = useState<boolean>(false);

    const [rolledCharm, setRolledCharm] = useState<number | null>(null);
    const [charmAcquireShow, setCharmAcquireShow] = useState<boolean>(false);

    const [victory, setVictory] = useState<boolean>(false);




    const handleEmbark = () => {
        // check if user is free and not already embarked
        // add new activity to firestore  with userid areaid duration completed

        setEmbarked(true);
        const area = areas[selectedArea];
        const duration = area.duration;
        let timeLeft = duration;
        let alpha = 1;
        const interval = setInterval(() => {
            timeLeft -= 0.1;
            if (timeLeft === 0)
                alpha = 0
            else
                alpha = timeLeft / duration;
            setProgress(alpha);
            if (timeLeft <= 0) {
                clearInterval(interval);
                embarkFinished(area.difficulty);
            }
        }, 100);
    }
    const embarkFinished = (difficulty: number) => {
        setVictory(true);
        setEmbarked(false);
        const reward: Reward = {
            gold: difficulty * 100,
            xp: difficulty * 20
        };
        // giveReward(reward);
        setReward(reward);
        RollRelic(setRolledCharm, setCharmAcquireShow);
        setShowResult(true);
    }

    const giveReward = async (reward: Reward) => {
        if (!userId) return;

        const heroRef = doc(db, "heroes", userId);

        await updateDoc(heroRef, {
            gold: increment(reward.gold),
            xp: increment(reward.xp),
        });
    }


    useEffect(() => {
        if (!userId) return;
        const loadHero = async () => {
            const _hero = await fetchHero(userId) || null;
            setHero(_hero);
        }
        loadHero();
    }, [])

    if (!userId) return (<p>login to see content.</p>);

    return (
        <>
            <div className="flex flex-col gap-2">
                <div className="flex flex-col w-fit items-center panel">
                    <h1 className="text-xl">{areas[selectedArea].name}</h1>
                    <div className="flex gap-2 items-center">
                        <button onClick={() => setSelectedArea(prev => (prev - 1 + areas.length) % areas.length)} className="button button-secondary">{"<"}</button>
                        <div className="w-fit h-fit bg-green-400 border-3 border-zinc-900">
                            <img className="w-48 h-48 object-cover" src={areas[selectedArea].img}></img>
                        </div>
                        <button onClick={() => setSelectedArea(prev => (prev + 1) % areas.length)} className="button button-secondary">{">"}</button>
                    </div>
                    {embarked &&
                        <ProgressBar progress={progress}></ProgressBar>
                    }
                    {!embarked &&
                        <button onClick={handleEmbark} className="w-fit button button-success">Embark</button>
                    }
                    <div className="flex flex-col p-2 w-full  bg-zinc-800 border-3 border-zinc-900">
                        <p>{areas[selectedArea].description}</p>
                        <p>Duration: {areas[selectedArea].duration}</p>
                        <p>Difficulty: {areas[selectedArea].difficulty}</p>
                    </div>
                </div>
            </div>
            { /*REWARD PANEL */}
            {(reward && hero && (showResult || charmAcquireShow)) &&
                <RewardPanel
                    victory={victory}
                    gold={reward.gold}
                    xp={reward.xp}
                    rolledCharm={rolledCharm}
                    playerHero={hero}
                    setShowRewardPanel={setShowResult}
                    charmAcquireShow={charmAcquireShow}
                    setCharmAcquireShow={setCharmAcquireShow}
                ></RewardPanel>
            }
        </>
    );

}
export default Embark;
import { useContext, useState } from "react";
import { UserContext } from "../Contexts/UserContext";
import ProgressBar from "./ProgressBar";
import { doc, increment, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { areas } from "../Areas";

type Reward = {
    gold: number;
    xp: number;
}

const Embark = () => {

    const context = useContext(UserContext);
    const userId = context?.userId;

    const [progress, setProgress] = useState(0);
    const [embarked, setEmbarked] = useState(false);
    const [selectedArea, setSelectedArea] = useState(0);

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
                setEmbarked(false);

                const reward: Reward = {
                    gold: area.difficulty * 100,
                    xp: area.difficulty * 20
                };
                giveReward(reward);
            }
        }, 100);
    }

    const giveReward = async (reward: Reward) => {
        if (!userId) return;

        const heroRef = doc(db, "heroes", userId);

        await updateDoc(heroRef, {
            gold: increment(reward.gold),
            xp: increment(reward.xp),
        });
    }

    return (


        <>
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
        </>
    );

}
export default Embark;
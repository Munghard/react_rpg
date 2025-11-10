import { useContext, useState } from "react";
import { UserContext } from "../Contexts/UserContext";
import ProgressBar from "./ProgressBar";

const Embark = () => {

    const { userId } = useContext(UserContext);

    const [progress, setProgress] = useState(0);
    const [embarked, setEmbarked] = useState(false);


    const handleEmbark = () => {
        // check if user is free and not already embarked
        // add new activity to firestore  with userid areaid duration completed
        // set button state to disabled 
        setEmbarked(true);
        const duration = 10;
        let timeLeft = duration;
        let alpha = 1;
        const interval = setInterval(() => {
            timeLeft -= 0.1;
            if (timeLeft === 0)
                alpha = 0
            else
                alpha = timeLeft / duration;
            console.log(alpha);
            setProgress(alpha);
            if (timeLeft <= 0) {
                clearInterval(interval);
                setEmbarked(false);
            }
        }, 100);
    }

    return (
        <>
            <div className="flex flex-col bg-zinc-700 border-3 border-zinc-900 p-2 m-2 gap-2 w-fit items-center">
                <h1 className="text-xl">Area</h1>
                <div className="flex gap-2 items-center">
                    <button className="button button-secondary">{"<"}</button>
                    <div className="w-48 h-48 bg-green-400">

                    </div>
                    <button className="button button-secondary">{">"}</button>
                </div>
                {embarked &&
                    <ProgressBar progress={progress}></ProgressBar>
                }
                <span>Area description.</span>
                <button onClick={handleEmbark} className="w-fit button button-success">Embark</button>
            </div>
        </>
    );

}
export default Embark;
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../Contexts/UserContext";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "./firebase";


const Hero = () => {

    const { userId, userName, avatarUrl } = useContext(UserContext);
    const [hero, setHero] = useState(null);
    const [heroName, setHeroName] = useState(userName || "");


    const NewHero = async () => {

        const heroData = {
            name: heroName,
            level: 1,
            xp: 0,
            gold: 100,
            userId: userId  // link to auth user
        };

        await setDoc(doc(db, "heroes", userId), heroData);
        setHero(heroData);
    }

    const fetchHero = async () => {
        if (!userId) return;
        const heroRef = doc(db, "heroes", userId);
        const heroSnap = await getDoc(heroRef);


        if (heroSnap.exists()) {
            setHero(heroSnap.data());
        }
        else {
            setHero(null);
        }
    }

    const deleteHero = async () => {
        if (confirm("Are you sure you want to delete your hero?")) {
            console.log("deleting hero")
            if (!userId) return;
            const heroRef = doc(db, "heroes", userId);
            const heroSnap = await deleteDoc(heroRef);
            setHero(null);
        }
    }


    useEffect(() => {
        fetchHero();
    }, [userId]);

    return (
        <>
            {hero &&
                <div className="flex flex-col m-2 p-2 w-fit bg-zinc-700 border-3 border-zinc-900 items-center">
                    <select onChange={(e) => { if (e.target.value === "delete") { deleteHero(); e.target.value = null; } }} className="text-black">
                        <option className="flex ms-auto"></option>
                        <option value={"delete"} className="flex ms-auto">Delete character</option>
                    </select>
                    <h1 className="text-xl">{hero.name}</h1>
                    <img className=" border-3 border-zinc-900" src={avatarUrl}></img>
                    <p className="text-xl text-zinc-300">Stats</p>
                    <p className="text-md text-zinc-400">Level: {hero.level}</p>
                    <p className="text-md text-zinc-400">Xp: {hero.xp}</p>
                    <p className="text-md text-zinc-400">Gold: {hero.gold}</p>
                </div>
            }
            {!hero &&
                <div className="flex flex-col w-fit bg-zinc-700 border-3 border-zinc-900 p-2 m-2 gap-2 items-center">
                    <label>Hero name:</label>
                    <input className="bg-zinc-900 text-white" type="text" value={heroName} onChange={(e) => setHeroName(e.target.value)}></input>
                    <button onClick={NewHero} className="button button-success">New hero</button>
                </div>
            }
        </>
    )

}

export default Hero;
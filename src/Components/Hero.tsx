import { useContext, useEffect, useState } from "react";
import { UserContext } from "../Contexts/UserContext";
import { deleteDoc, doc, getDoc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import HeroView from "./HeroView";
import { Items } from "./Items";

export type HeroData = {
    userId?: string;
    name: string;
    avatarUrl: string;
    level: number;
    xp: number;
    gold: number;
    hp: number;
    attack: number;
    defense: number;
    charmId?: number;
}

export const fetchHero = async (userId: string) => {
    if (!userId) return;
    const heroRef = doc(db, "heroes", userId);
    const heroSnap = await getDoc(heroRef);
    if (heroSnap.exists()) {
        return heroSnap.data() as HeroData;
    }
    return null;
}

const deleteHero = async (id: string) => {
    if (confirm("Are you sure you want to delete your hero?")) {
        console.log("deleting hero")
        if (!id) return;
        const heroRef = doc(db, "heroes", id);
        await deleteDoc(heroRef);
    }
}
type HeroProps = {
    heroData: HeroData | null;
};
export const Hero = (heroData: HeroProps) => {

    const context = useContext(UserContext);
    if (!context) return null;
    const { userId, userName, avatarUrl } = context;
    const [hero, setHero] = useState<HeroData | null>(heroData.heroData);
    const [heroName, setHeroName] = useState(userName || heroData.heroData?.name);

    const NewHero = async () => {
        if (!userId || !avatarUrl) return null;
        const heroData: HeroData = {
            name: heroName || "default",
            avatarUrl: avatarUrl,
            level: 1,
            xp: 0,
            gold: 100,
            hp: 100,
            attack: 10,
            defense: 10,
            userId: userId,  // link to auth user
        };

        await setDoc(doc(db, "heroes", userId), heroData);
        setHero(heroData);
    }

    const setCharm = async (charmId: number, userId: string) => {
        console.log("trying to set charm on player");
        const heroRef = doc(db, "heroes", userId);
        await updateDoc(heroRef, "charmId", charmId);
    }

    useEffect(() => {
        const loadHero = async () => {
            const heroSnap = await fetchHero(userId!);
            if (heroSnap) setHero(heroSnap);
        }
        loadHero();
    }, [userId]);

    useEffect(() => {
        if (!userId) return;

        const heroRef = doc(db, "heroes", userId);
        const unsubscribe = onSnapshot(heroRef, (snapshot) => {
            if (snapshot.exists()) {
                setHero(snapshot.data() as HeroData);
            }
            else {
                setHero(null);
            }
        });
        return () => unsubscribe();
    }, [userId]);

    if (!userId) return (<p>login to see content.</p>);

    return (
        <>
            {userId &&
                <div className="flex flex-col h-fit panel-secondary">
                    <h1 className="text-xl">Player hero</h1>
                    <HeroView heroData={hero}></HeroView>
                    <select onChange={(e) => {
                        if (e.target.value === "delete") {
                            if (userId) {
                                deleteHero(userId);
                                setHero(null);
                                e.target.value = "";
                            }
                        }
                    }} className="text-black bg-zinc-700">
                        <option className="flex ms-auto">Actions</option>
                        <option value={"delete"} className="flex ms-auto">Delete character</option>
                    </select>
                    <h1>Charm selection</h1>

                    <select
                        value={hero?.charmId}
                        className="text-black bg-zinc-700"
                        onChange={(e) => {
                            if (userId) {
                                setCharm(Number(e.target.value), userId)
                            }
                        }}>
                        <option value={""} className="flex ms-auto">None</option>
                        {Items.map((item, index) =>
                            <option key={index} value={index} className="flex ms-auto">{item.name} Atk:{item.bonusAttack ?? "-"} Def:{item.bonusDefense ?? "-"}</option>
                        )}
                    </select>

                    {!hero &&
                        <div className="flex flex-col w-fit bg-zinc-700 border-3 border-zinc-900 p-2 m-2 gap-2 items-center">
                            <label>Hero name:</label>
                            <input className="bg-zinc-900 text-white" type="text" value={heroName} onChange={(e) => setHeroName(e.target.value)}></input>
                            <button onClick={NewHero} className="button button-success">New hero</button>
                        </div>
                    }
                </div>
            }
        </>
    )

}

export default Hero;
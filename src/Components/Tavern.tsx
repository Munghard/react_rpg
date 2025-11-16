import { collection, getDocs } from "firebase/firestore";
import { HeroData } from "./Hero";
import { db } from "./firebase";
import { useEffect, useState } from "react";

const Tavern = () => {

    const [heroes, setHeroes] = useState<HeroData[]>([]);

    const fetchHeros = async () => {
        const heroesCollection = collection(db, "heroes");
        const heroSnaps = await getDocs(heroesCollection);

        const heroes: HeroData[] = heroSnaps.docs.map(doc => doc.data() as HeroData);
        setHeroes(heroes);
    }

    useEffect(() => {
        fetchHeros();
    }, [])

    return (
        <div className="flex flex-col gap-2 items-center">
            <h1 className="text-5xl">Leaderboard</h1>
            <table className="table border-3 border-zinc-900 text-center min-w-150 ">
                <thead className="bg-zinc-700">
                    <tr>
                        <th>Placing</th>
                        <th>Avatar</th>
                        <th>Name</th>
                        <th>Level</th>
                        <th>XP</th>
                        <th>Gold</th>
                    </tr>
                </thead>
                <tbody>
                    {heroes.map((hero, index) =>
                        <tr key={hero.userId} className="bg-zinc-800 border-3 border-zinc-900">
                            <td>{index + 1}# </td>
                            <td><img className="w-10 h-10 rounded-full mx-auto" src={hero.avatarUrl}></img></td>
                            <td>{hero.name} </td>
                            <td> {hero.level}</td>
                            <td> {hero.xp.toFixed(1)} </td>
                            <td> {hero.gold.toFixed(1)}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )

}

export default Tavern;
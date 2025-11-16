import { useContext, useEffect, useState } from "react";
import Hero, { HeroData, fetchHero } from "./Hero";
import { UserContext } from "../Contexts/UserContext";
import HeroView from "./HeroView";
import { OtherHeros } from "./Enemies";
import { Links } from "./Links";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import CharmAcquire from "./CharmAcquire";
import { Items } from "./Items";

interface CombatHero {
    hero: HeroData;     // reference to DB hero
    currentHp: number;  // temporary
}


const Combat = () => {

    const context = useContext(UserContext);
    const userId = context?.userId;
    if (!userId) return null;

    const [playerCombatHero, setPlayerCombatHero] = useState<CombatHero | null>(null);
    const [otherCombatHero, setOtherCombatHero] = useState<CombatHero | null>(null);
    const [playerTurn, setPlayerTurn] = useState<boolean>(true);
    const [log, setLog] = useState<string | null>(null);
    const [autoCombat, setAutoCombat] = useState<boolean>(false);
    const [charmAcquireShow, setCharmAcquireShow] = useState<boolean>(false);
    const [victoryShow, setVictoryShow] = useState<boolean>(false);
    const [rolledCharm, setRolledCharm] = useState<number | null>(null);
    const [combatSpeed, setCombatSpeed] = useState<number>(1);

    const actionDelay = 2000;

    useEffect(() => {
        const loadHero = async () => {
            const hero = await fetchHero(userId) || null;
            if (!hero) return;
            const combatHero: CombatHero = {
                hero: hero,
                currentHp: hero.hp,
            }
            setPlayerCombatHero(combatHero);
        }
        loadHero();

    }, [])

    const setLogEntry = (entry: string) => {
        setLog(prev => prev ? `\n\n${entry}<-->\n\n${prev}` : `\n\n${entry}`);
    }

    const Attack = (attacker: CombatHero, defender: CombatHero) => {
        const attackRoll = Math.floor(Math.random() * attacker.hero.attack);
        const defenseRoll = Math.floor(Math.random() * defender.hero.defense);
        const hit = attackRoll > defenseRoll;
        setLogEntry(`${attacker.hero.name} attacking ${defender.hero.name}, attack roll: ${attackRoll}, defense roll: ${defenseRoll}, hit: ${hit}`);
        if (hit) {
            defender.currentHp -= attacker.hero.attack;
        }
    }


    const handleSwapCharm = async (id: number) => {
        const heroRef = doc(db, "heroes", userId);
        await updateDoc(heroRef, { charmId: id });
        setCharmAcquireShow(false)
        console.log("charm swapped");
        setPlayerCombatHero(prev => ({
            ...prev!,
            charmId: id
        }));
    }

    const PlayerWins = async () => {
        if (!otherCombatHero || !playerCombatHero) return;
        playerCombatHero.currentHp = 100;
        playerCombatHero.hero.gold += otherCombatHero.hero.gold;
        playerCombatHero.hero.xp += otherCombatHero.hero.xp;
        setLogEntry(`Player gains: gold:${otherCombatHero.hero.gold.toFixed(1)}, gains: xp:${otherCombatHero.hero.xp.toFixed(1)}`);
        await wait(actionDelay);

        //update db
        const heroRef = doc(db, "heroes", userId);
        await updateDoc(heroRef, { gold: playerCombatHero.hero.gold, xp: playerCombatHero.hero.xp });
        // roll get charm
        const rollCharmGet = Math.random();
        if (rollCharmGet > 0.5) {
            const rolledId = Math.floor(Math.random() * Items.length);
            setRolledCharm(rolledId);
            setCharmAcquireShow(true);
        }
        setVictoryShow(true);

        randomizeOtherHero();
    }

    const EnemyWins = async () => {
        if (!otherCombatHero || !playerCombatHero) return;
        playerCombatHero.currentHp = 100;
        playerCombatHero.hero.gold -= otherCombatHero.hero.gold;
        playerCombatHero.hero.xp += otherCombatHero.hero.xp;
        setLogEntry(`Player loses: gold:${otherCombatHero.hero.gold.toFixed(1)}, gains xp:${otherCombatHero.hero.xp.toFixed(1)}`);

        await wait(actionDelay);

        //update db
        const heroRef = doc(db, "heroes", userId);
        await updateDoc(heroRef, { gold: playerCombatHero.hero.gold, xp: playerCombatHero.hero.xp });

        randomizeOtherHero();
    }

    const handlePlayerAttack = async () => {
        if (!otherCombatHero || !playerCombatHero) return;
        await wait(actionDelay);
        Attack(playerCombatHero, otherCombatHero);
        await wait(actionDelay);
        if (otherCombatHero.currentHp <= 0) {
            await PlayerWins();
        }
        else {
            setPlayerTurn(false);
        }
    }

    const handleEnemyTurn = async () => {
        if (!otherCombatHero || !playerCombatHero) return;
        await wait(actionDelay);
        Attack(otherCombatHero, playerCombatHero);
        await wait(actionDelay);
        if (playerCombatHero.currentHp <= 0) {
            await EnemyWins();
        }
        else {
            setPlayerTurn(true);
            if (autoCombat) {
                handlePlayerAttack();
            }
        }
    }

    useEffect(() => {
        if (!playerTurn) {
            handleEnemyTurn();
        }
    }, [playerTurn])

    // delay helper
    function wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms / combatSpeed));
    }

    const selectOtherHero = (hero: HeroData) => {
        const combatHero: CombatHero = {
            hero: hero,
            currentHp: hero.hp,
        }
        setOtherCombatHero(combatHero);
    }
    const randomizeOtherHero = () => {
        const other = OtherHeros[Math.floor(Math.random() * OtherHeros.length)];
        const combatHero: CombatHero = {
            hero: other,
            currentHp: other.hp,
        }
        setOtherCombatHero({ ...combatHero });
    }

    return (
        <>
            {!otherCombatHero &&
                <div className="flex flex-col gap-2 items-center">
                    <h1 className="text-xl">Select opponent</h1>
                    <div className="flex gap-2 flex-wrap">
                        {OtherHeros.sort((a, b) => a.level - b.level).map(oh =>
                            <div onClick={() => selectOtherHero(oh)} className="panel cursor-pointer">
                                <img className="w-24 h-24 object-cover border-3 border-zinc-950" src={oh.avatarUrl}></img>
                                <h1>{oh.name}</h1>
                                <h1>Level: {oh.level}</h1>
                            </div>
                        )}
                    </div>
                </div>
            }
            {otherCombatHero &&

                <div className="flex flex-col w-fit h-fit items-center panel-secondary">
                    <h1 className="text-2xl underline">Combat</h1>
                    <div className="flex gap-2">
                        {playerCombatHero && <HeroView currentHp={playerCombatHero.currentHp} heroData={playerCombatHero.hero}></HeroView>}
                        <div className="flex flex-col gap-2">
                            <img className="w-48 h-48 grayscale panel-secondary" src={Links.crossedSwords}></img>
                            <div className="flex flex-col h-full w-full panel">
                                <div className="flex gap-2">
                                    <span className="text-xl text-zinc-400">Log:</span>
                                </div>
                                {log &&
                                    <p id="log" className="max-w-40 max-h-40 min-h-40 overflow-auto bg-zinc-800 p-2">{log}</p>
                                }
                            </div>
                        </div>
                        {otherCombatHero && <HeroView currentHp={otherCombatHero.currentHp} heroData={otherCombatHero.hero}></HeroView>}
                    </div>
                    {(!charmAcquireShow) &&
                        <>
                            <div className="flex gap-2">
                                <button disabled={!playerTurn} onClick={handlePlayerAttack} className="button button-danger">Attack</button>
                                <button disabled={!playerTurn} onClick={() => setOtherCombatHero(null)} className="button button-warning">Flee</button>
                                <button onClick={() => setLog("")} className="button button-secondary">Clear log</button>
                            </div>
                            <div className="flex items-center gap-2">
                                <label>Combat speed</label>
                                <select className="bg-zinc-700" onChange={(e) => setCombatSpeed(Number(e.target.value))}>
                                    <option className="text-black" value={1}>1x</option>
                                    <option className="text-black" value={2}>2x</option>
                                    <option className="text-black" value={4}>4x</option>
                                    <option className="text-black" value={8}>8x</option>
                                    <option className="text-black" value={16}>16x</option>
                                </select>
                                <label>Auto combat</label>
                                <input type="checkbox" onChange={(e) => setAutoCombat(e.target.checked)} checked={autoCombat} title="Auto combat"></input>
                            </div>
                        </>
                    }
                    {(playerCombatHero && rolledCharm && (victoryShow || charmAcquireShow)) &&
                        <div className="inset-0 bg-black/50 absolute w-full h-full backdrop-blur-sm">
                            <div className="flex flex-col items-center panel absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <h1 className="text-2xl">💎Victory!💎</h1>
                                <p>Award:</p>
                                <span>✨ Xp:{otherCombatHero?.hero.xp.toFixed(1)},
                                    🪙 Gold:{otherCombatHero?.hero.gold.toFixed(1)}</span>
                                <button className="button button-success" onClick={() => setVictoryShow(false)}>Accept</button>
                                {charmAcquireShow &&
                                    <>
                                        <div className="flex flex-col items-center panel-secondary">
                                            <h1 className="text-xl">Looted new charm!</h1>
                                            <CharmAcquire
                                                newCharmId={rolledCharm}
                                                oldCharmId={playerCombatHero.hero.charmId || null}
                                                skip={() => { setCharmAcquireShow(false); }}
                                                swap={async (id) => { await handleSwapCharm(id); }}
                                            ></CharmAcquire>
                                        </div>
                                    </>
                                }
                            </div>
                        </div>
                    }
                </div>
            }
        </>
    )


}
export default Combat;
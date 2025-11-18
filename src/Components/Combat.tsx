import { useContext, useEffect, useState } from "react";
import Hero, { HeroData, fetchHero } from "./Hero";
import { UserContext } from "../Contexts/UserContext";
import HeroView from "./HeroView";
import { OtherHeros } from "./Enemies";
import { Links } from "./Links";
import { RollRelic } from "./RewardPanel";

export interface CombatHero {
    hero: HeroData;     // reference to DB hero
    currentHp: number;  // temporary
}

interface CombatProps {
    canFlee: boolean,
    otherCombatHero: CombatHero,
    setOtherCombatHero: (ch: CombatHero | null) => void;
    setResult: (bool: boolean) => void;
    showRewardPanel: (props: any) => void; // new prop
}

const Combat = ({ canFlee, otherCombatHero, setOtherCombatHero, setResult, showRewardPanel }: CombatProps) => {

    const context = useContext(UserContext);
    const userId = context?.userId;

    const [playerCombatHero, setPlayerCombatHero] = useState<CombatHero | null>(null);
    const [playerTurn, setPlayerTurn] = useState<boolean>(true);
    const [log, setLog] = useState<string | null>(null);
    const [autoCombat, setAutoCombat] = useState<boolean>(true);
    const [charmAcquireShow, setCharmAcquireShow] = useState<boolean>(false);
    const [combatResultShow, setCombatResultShow] = useState<boolean>(false);
    const [victory, setVictory] = useState<boolean>(false);
    const [rolledCharm, setRolledCharm] = useState<number | null>(null);
    const [combatSpeed, setCombatSpeed] = useState<number>(16);

    const actionDelay = 2000;

    useEffect(() => {
        const loadHero = async () => {
            if (!userId) return;
            const hero = await fetchHero(userId) || null;
            if (!hero) return;
            const combatHero: CombatHero = {
                hero: hero,
                currentHp: hero.hp,
            }
            setPlayerCombatHero(combatHero);
        }
        loadHero();

    }, [userId])

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

    const PlayerWins = async () => {
        if (!otherCombatHero || !playerCombatHero) return;
        setVictory(true);
        playerCombatHero.currentHp = 100;

        setLogEntry(`Player gains: gold:${otherCombatHero.hero.gold.toFixed(1)}, gains: xp:${otherCombatHero.hero.xp.toFixed(1)}`);
        await wait(actionDelay);
        // roll get charm
        const l = otherCombatHero.hero.level;
        const relicChance = l == 3 ? 0.5 : l == 2 ? 0.2 : l == 1 ? 0.1 : 0;
        RollRelic(setRolledCharm, setCharmAcquireShow, relicChance);

        setCombatResultShow(true);
        setResult(true);
        setOtherCombatHero(null);

        // Show reward panel in Maze
        showRewardPanel({
            victory: true,
            gold: otherCombatHero.hero.gold,
            xp: otherCombatHero.hero.xp,
            rolledCharm,
            playerHero: playerCombatHero.hero,
            charmAcquireShow,
            setCharmAcquireShow,
        });
    }

    const EnemyWins = async () => {
        if (!otherCombatHero || !playerCombatHero) return;
        setVictory(false);
        playerCombatHero.currentHp = playerCombatHero.hero.hp;

        setLogEntry(`Player loses: gold:${otherCombatHero.hero.gold.toFixed(1)}, gains xp:${otherCombatHero.hero.xp.toFixed(1)}`);

        await wait(actionDelay);
        setCombatResultShow(true);

        setPlayerTurn(true);
        setResult(false);
        setOtherCombatHero(null);

        // Show reward panel in Maze
        showRewardPanel({
            victory: false,
            gold: otherCombatHero.hero.gold,
            xp: otherCombatHero.hero.xp,
            rolledCharm,
            playerHero: playerCombatHero.hero,
            charmAcquireShow,
            setCharmAcquireShow,
        });
    }

    const handlePlayerAttack = async () => {
        // state for disabling buttons
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


    const randomizeOtherHero = () => {
        const other = OtherHeros[Math.floor(Math.random() * OtherHeros.length)];
        const combatHero: CombatHero = {
            hero: other,
            currentHp: other.hp,
        }
        setOtherCombatHero({ ...combatHero });
    }

    if (!userId) return (<p>login to see content.</p>);

    return (
        <>
            { /* HEROES AND LOG */}
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
                                    <p id="log" className="max-w-40 max-h-40 min-h-40 overflow-auto bg-zinc-800 p-2 border-3 border-zinc-900">{log}</p>
                                }
                            </div>
                        </div>
                        {otherCombatHero && <HeroView currentHp={otherCombatHero.currentHp} heroData={otherCombatHero.hero}></HeroView>}
                    </div>
                    { /* BUTTONS */}
                    {(!combatResultShow) &&
                        <>
                            <div className="flex gap-2">
                                <button disabled={!playerTurn} onClick={handlePlayerAttack} className="button button-danger">Attack</button>
                                {canFlee && <button disabled={!playerTurn} onClick={() => setOtherCombatHero(null)} className="button button-warning">Flee</button>}
                                <button onClick={() => setLog("")} className="button button-secondary">Clear log</button>
                            </div>
                            <div className="flex items-center gap-2">
                                <label>Combat speed</label>
                                <select className="bg-zinc-700" value={combatSpeed} onChange={(e) => setCombatSpeed(Number(e.target.value))}>
                                    <option className="text-black" value={1}>1x</option>
                                    <option className="text-black" value={4}>4x</option>
                                    <option className="text-black" value={16}>16x</option>
                                </select>
                                <label>Auto combat</label>
                                <input type="checkbox" onChange={(e) => setAutoCombat(e.target.checked)} checked={autoCombat} title="Auto combat"></input>
                            </div>
                        </>
                    }
                </div>
            }
        </>
    )


}
export default Combat;



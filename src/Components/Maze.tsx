import { useContext, useEffect, useState } from "react";
import { getRandomEnemy, OtherHeros } from "./Enemies";
import { fetchHero, HeroData } from "./Hero";
import { UserContext } from "../Contexts/UserContext";
import { Links } from "./Links";
import Combat, { CombatHero } from "./Combat";
import RewardPanel, { RollRelic } from "./RewardPanel";

type HeroCoord = {
    coord: Vector2,
    hero: HeroData,
}

class Vector2 {
    constructor(public x: number, public y: number) { }

    add(other: Vector2): Vector2 {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    sub(other: Vector2): Vector2 {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

}

const Maze = () => {

    const sizeX = 12;
    const sizeY = 12;
    const walkSteps = 32;
    const enemyDensity = 0.2;
    const gridCellPx = 64; // or any pixel size you want

    const directions: Vector2[] = [
        new Vector2(1, 0),
        new Vector2(-1, 0),
        new Vector2(0, 1),
        new Vector2(0, -1),
    ]

    const [heroCoords, setHeroCoords] = useState<HeroCoord[]>([])
    const [pathCoords, setPathCoords] = useState<Vector2[]>([])
    const [exitCoord, setExitCoord] = useState<Vector2>()
    const [otherCombatHero, setOtherCombatHero] = useState<CombatHero | null>(null);
    const [rewardRecieved, setRewardRecieved] = useState<boolean>(false)
    const [showRewardPanel, setShowRewardPanel] = useState(false);
    const [rewardPanelProps, setRewardPanelProps] = useState<any>(null);
    const [inMaze, setInMaze] = useState<boolean>(false);

    const context = useContext(UserContext);
    if (!context) return null;
    const { userId } = context;

    if (!userId) return (<p>login to see content.</p>);

    const handleVictory = (value: boolean) => {
        if (value) // victory
        {
            // remove enemy from heroCoords
            // find coord where player is, then remove other heroes with same coord
            const playerCoord = heroCoords.find(c => c.hero.userId != null)?.coord;
            if (!playerCoord) return;

            // Remove enemies at the same coord as player
            const newHeroCoords = heroCoords.filter(
                h => h.hero.userId != null || h.coord.x !== playerCoord.x || h.coord.y !== playerCoord.y
            );
            setHeroCoords(newHeroCoords);
            setOtherCombatHero(value ? null : otherCombatHero)
        }
        else { // defeat

        }
    }

    const isNeighbourCoord = (coord: Vector2, otherCoord: Vector2) => {
        return directions.some(dir => {
            const neighbor = otherCoord.add(dir);
            return coord.x === neighbor.x && coord.y === neighbor.y;
        });
    };

    const handleShowRewardPanel = (props: any) => {
        setRewardPanelProps(props);
        setShowRewardPanel(true);
    };

    const handleTileClick = (coord: Vector2) => {
        // can reach
        const player = heroCoords.find(hc => hc.hero.userId != null);
        if (!player) return;

        // can move
        if (isNeighbourCoord(coord, player.coord)) {

            if (heroCoords.some(c => c.coord.x === coord.x && c.coord.y === coord.y)) {
                const enemy = heroCoords.find(c => c.coord.x === coord.x && c.coord.y === coord.y)?.hero
                if (!enemy) return;
                const ch: CombatHero = { hero: enemy, currentHp: enemy.hp }
                setOtherCombatHero(ch);
                console.log("Should start combat")
            }
            else {
                setOtherCombatHero(null);
            }

            // Check if player reached the exit
            if (exitCoord && coord.x === exitCoord.x && coord.y === exitCoord.y) {
                setInMaze(false);
                // EXIT MAZE GIVE REWARD
                // Example reward: 50 gold, 25 xp
                setRewardPanelProps({
                    victory: true,
                    gold: 500,
                    xp: 100,
                    rolledCharm: null,
                    playerHero: player.hero,
                    charmAcquireShow: false,
                    setCharmAcquireShow: () => { },
                });
                setShowRewardPanel(true);
            }

            // move player
            player.coord = coord;
            // replace player
            setHeroCoords(prev =>
                prev.map(hc => hc.hero.userId === player.hero.userId ? { ...hc, coord: coord } : hc)
            );
        }
    }

    const generateMaze = async () => {
        const startCoord: Vector2 = new Vector2(Math.floor(sizeX / 2), Math.floor(sizeY / 2))
        const path: Vector2[] = [startCoord]
        const heroes: HeroCoord[] = []
        const playerHero = await fetchHero(userId);
        if (!playerHero) return null;

        heroes.push({ coord: startCoord, hero: playerHero })
        let prevCoord: Vector2 = startCoord;
        for (let index = 0; index < walkSteps; index++) {
            let randomDir = directions[Math.floor(Math.random() * directions.length)]
            for (let subStep = 0; subStep < 2; subStep++) {


                let currentCoord = prevCoord.add(randomDir);
                currentCoord.x = Math.max(0, Math.min(currentCoord.x, sizeX - 1))
                currentCoord.y = Math.max(0, Math.min(currentCoord.y, sizeY - 1))
                prevCoord = currentCoord;

                if (!path.some(coord => coord.x === currentCoord.x && coord.y === currentCoord.y)) {
                    path.push(currentCoord);
                    if (Math.random() < enemyDensity) {
                        let enemy = getRandomEnemy();
                        const enemyCoord = { coord: currentCoord, hero: enemy }
                        heroes.push(enemyCoord)
                    }
                }
            };
        }
        setPathCoords(path);
        setHeroCoords(heroes);
        const empty = path.filter(x => !heroes.some(h => h.coord === x));
        const exit = empty[empty.length - 1];
        // random exit
        // const exit = empty[Math.floor(Math.random() * empty.length)];
        setExitCoord(exit);
    }

    useEffect(() => {
        generateMaze();
    }, [])

    // console.log(pathCoords.map(c => `(${c.x},${c.y})`));

    return (

        <>
            <div className="flex flex-col gap-2 items-center">
                {!inMaze && <button onClick={() => { setInMaze(true); generateMaze(); }} className="button button-secondary">Enter maze</button>}
                {inMaze &&
                    <div className="flex gap-2 items-center">
                        <h1 className="text-3xl">Maze</h1>
                        <button onClick={generateMaze} className="button button-secondary">Regen</button>
                    </div>
                }
                {inMaze && pathCoords.length > 0 &&
                    <div
                        className="grid gap-2 panel"
                        style={{ gridTemplateColumns: `repeat(${sizeX}, 1fr)` }}
                    >
                        {Array.from({ length: sizeX * sizeY }).map((_, index) => {
                            const row = Math.floor(index / sizeY);
                            const col = index % sizeY;
                            const coord = new Vector2(col, row);
                            const isPath = pathCoords.some(c => c.x === col && c.y === row);
                            const hero = heroCoords.find(c => c.coord.x === col && c.coord.y === row)?.hero;
                            const exit = exitCoord && exitCoord.x === col && exitCoord.y === row;
                            const title = exit ? "Exit" : hero ? hero.name + ", Level:" + hero.level : "";
                            return (
                                <div
                                    onClick={() => handleTileClick(coord)}
                                    title={title}
                                    key={index}
                                    className={`
                                    p-0 border-4 hover:border-white! 
                                    ${isPath ? "bg-zinc-500  border-zinc-400" : ""}
                                    ${hero && !hero.userId ? "border-rose-600! " : ""}
                                    ${hero?.userId ? " border-green-600!" : ""}
                                    ${exit ? " border-amber-600!" : ""}
                                    ${!isPath && !hero ? "bg-zinc-800 border-0!" : ""}
                                `}
                                    style={{
                                        width: `${gridCellPx}px`,
                                        height: `${gridCellPx}px`
                                    }}
                                >
                                    {hero && <img className="w-full h-full object-cover" src={hero?.avatarUrl ?? "-"}></img>}
                                    {!hero && exit && <img className="w-full h-full object-cover" src={Links.exit}></img>}
                                </div>
                            );
                        })}
                    </div>

                }
                {otherCombatHero && !rewardRecieved &&
                    <div className="inset-0 absolute backdrop-blur-sm bg-black/70 place-items-center content-center">
                        <Combat
                            canFlee={false}
                            otherCombatHero={otherCombatHero}
                            setOtherCombatHero={setOtherCombatHero}
                            setResult={(e: React.SetStateAction<boolean>) => { const value = typeof e === "function" ? e(true) : e; handleVictory(value); }}
                            showRewardPanel={handleShowRewardPanel} // pass callback
                        />
                    </div>
                }
                {showRewardPanel && rewardPanelProps &&
                    <RewardPanel
                        {...rewardPanelProps}
                        setShowRewardPanel={(v: boolean) => {
                            setShowRewardPanel(v);
                            if (!v) setRewardRecieved(true);
                        }}
                    />
                }
            </div>
        </>
    )

}
export default Maze;
import React, { useContext } from "react";
import { UserContext } from "../Contexts/UserContext";
import { Page } from "../App";

interface NavbarProps {
    setCurrentPage: React.Dispatch<React.SetStateAction<Page>>;
}

const Navbar = (props: NavbarProps) => {

    const context = useContext(UserContext);
    if (!context) return null;
    const { userName, avatarUrl, userId, signInWithGoogle, signOutUser } = context;

    const handleSignOut = () => {
        signOutUser();
    }

    return (
        <div className="flex flex-col w-full bg-zinc-800 border-b-3 border-zinc-900">
            <div className="flex bg-zinc-700 px-5 border-b-3 border-zinc-900">
                <h1
                    style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.7),0px 0px 16px rgba(255,255,255,0.5)" }}
                    className="text-7xl jacquard-12-regular text-zinc-900">Relic <span className="text-4xl">of</span> myth</h1>
                <div className='flex gap-2 p-2 ms-auto'>
                    {userId &&
                        <>
                            <div className='flex gap-2'>
                                <p className='text-sm font-bold hidden lg:block md:block text-green-500 h-fit'>Logged in as: {userName}</p>
                                {avatarUrl && <img src={avatarUrl} className='max-w-12 max-h-12 rounded-4xl lg:ms-auto md:ms-auto border-3 border-green-500'></img>}
                            </div>
                            <button onClick={handleSignOut} className="button button-secondary">
                                <i className='fa fa-sign-out-alt' ></i> Sign out
                            </button>
                        </>

                    }
                    {!userId &&
                        <>
                            <p className='text-sm font-bold text-red-500'>Log in to use the app</p>
                            <button onClick={signInWithGoogle} className="button button-success">
                                <i className='fa-brands fa-google text-green-400' ></i> Sign in
                            </button>
                        </>
                    }

                </div>
            </div>
            <div className='flex flex-wrap gap-2 p-2 place-content-between text-2xl'>
                <button onClick={() => props.setCurrentPage("Hero")} style={{ textShadow: "0px 4px 4px rgba(0,0,0,0.7)" }} className="text-zinc-500 font-bold hover:text-zinc-300">Hero</button>
                <button onClick={() => props.setCurrentPage("Maze")} style={{ textShadow: "0px 4px 4px rgba(0,0,0,0.7)" }} className="text-zinc-500 font-bold hover:text-zinc-300">Maze</button>
                <button onClick={() => props.setCurrentPage("Train")} style={{ textShadow: "0px 4px 4px rgba(0,0,0,0.7)" }} className="text-zinc-500 font-bold hover:text-zinc-300">Train</button>
                <button onClick={() => props.setCurrentPage("Embark")} style={{ textShadow: "0px 4px 4px rgba(0,0,0,0.7)" }} className="text-zinc-500 font-bold hover:text-zinc-300">Embark</button>
                <button onClick={() => props.setCurrentPage("Tavern")} style={{ textShadow: "0px 4px 4px rgba(0,0,0,0.7)" }} className="text-zinc-500 font-bold hover:text-zinc-300" >Tavern</button>
                <button onClick={() => props.setCurrentPage("Trade")} style={{ textShadow: "0px 4px 4px rgba(0,0,0,0.7)" }} className="text-zinc-500 font-bold hover:text-zinc-300" >Relics</button>
                <button onClick={() => props.setCurrentPage("Craft")} style={{ textShadow: "0px 4px 4px rgba(0,0,0,0.7)" }} className="text-zinc-500 font-bold hover:text-zinc-300 line-through" >Craft</button>
                <button onClick={() => props.setCurrentPage("Friends")} style={{ textShadow: "0px 4px 4px rgba(0,0,0,0.7)" }} className="text-zinc-500 font-bold hover:text-zinc-300 line-through" >Friends</button>
            </div>
        </div>
    )
}

export default Navbar;
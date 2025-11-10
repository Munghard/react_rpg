import { useContext } from "react";
import { UserContext } from "../Contexts/UserContext";

const Navbar = () => {

    const { userName, avatarUrl, userId, signInWithGoogle, signOutUser } = useContext(UserContext);

    const handleSignOut = () => {
        signOutUser();
    }

    return (
        <div className="flex flex-col w-full ">
            <div className="flex bg-zinc-700 px-5 border-b-3 border-zinc-900">
                <h1 className="text-7xl jacquard-12-regular text-zinc-900">Dungeon RPG</h1>
                <div className='flex gap-2 p-2 ms-auto'>
                    {userId &&
                        <div className='flex gap-2'>
                            <p className='text-sm font-bold hidden lg:block md:block text-green-500 h-fit'>Logged in as: {userName}</p>
                            {avatarUrl && <img src={avatarUrl} className='h-12 w-12 rounded-4xl lg:ms-auto md:ms-auto border-2 border-green-500'></img>}
                        </div>
                    }
                    {!userId &&
                        <button onClick={signInWithGoogle} className="button button-success">
                            <i className='fa-brands fa-google text-green-400' ></i> Sign in
                        </button>
                    }
                    {userId &&
                        <button onClick={handleSignOut} className="button button-secondary">
                            <i className='fa fa-sign-out-alt' ></i> Sign out
                        </button>
                    }
                    {!userId && <p className='text-sm font-bold text-red-500'>Log in to use the app</p>}
                </div>

            </div>
            <div className='flex gap-2 p-2 place-content-between'>
                <button className="text-zinc-500 font-bold hover:text-zinc-300">Hero</button>
                <button className="text-zinc-500 font-bold hover:text-zinc-300">Tavern</button>
                <button className="text-zinc-500 font-bold hover:text-zinc-300">Train</button>
                <button className="text-zinc-500 font-bold hover:text-zinc-300">Embark</button>
                <button className="text-zinc-500 font-bold hover:text-zinc-300">Trade</button>
                <button className="text-zinc-500 font-bold hover:text-zinc-300">Craft</button>
                <button className="text-zinc-500 font-bold hover:text-zinc-300">Friends</button>
            </div>
        </div>
    )
}

export default Navbar;
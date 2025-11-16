import { useContext, useEffect, useState } from 'react'
import './App.css'
import Combat from './Components/Combat'
import Embark from './Components/Embark'
import Hero, { HeroData, fetchHero } from './Components/Hero'
import Navbar from './Components/Navbar'
import { UserContext } from './Contexts/UserContext'
import HeroView from './Components/HeroView'
import Tavern from './Components/Tavern'
import ItemList from './Components/Items'

export type Page = "Hero" | "Tavern" | "Train" | "Embark" | "Trade" | "Craft" | "Friends";

function App() {


  const [currentPage, setCurrentPage] = useState<Page>("Hero");

  const context = useContext(UserContext);
  if (!context) return null;
  const { userId } = context;

  const [playerHero, setPlayerHero] = useState<HeroData | null>(null);
  useEffect(() => {
    const loadHero = async () => {
      setPlayerHero(await fetchHero(userId!) || null);
    }
    loadHero();
  }, [])

  return (
    <>
      <Navbar setCurrentPage={setCurrentPage}></Navbar>

      <div className='flex m-2 gap-2 justify-center'>
        {currentPage === 'Hero' &&
          <Hero heroData={playerHero}></Hero>
        }
        {currentPage === 'Embark' &&
          <Embark></Embark>
        }
        {currentPage === 'Train' &&
          <Combat></Combat>
        }
        {currentPage === 'Tavern' &&
          <Tavern></Tavern>
        }
        {currentPage === 'Trade' &&
          <ItemList></ItemList>
        }
      </div>
    </>
  )
}

export default App

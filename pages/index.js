import { useRouter } from 'next/router';
import Image from "next/image";
import TopPanel from './TopPanel';
import BottomNavigation from './BottomNavigation';

export default function Home() {
  const router = useRouter();

  const createGame = async () => {
    try {
      const response = await fetch('/api/game/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to create game: ${response.statusText}`);
      }

      const { id } = await response.json();
      router.push(`/game/${id}`);
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const searchGame = () => {
    router.push('/games');
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center">
      <TopPanel />
      <div
        className="flex-grow w-full px-4 pt-8 pb-16"
        style={{
          background:
            "linear-gradient(0.00deg, rgb(0 0 0), rgb(0, 0, 0), rgb(34, 34, 34) 30.16%, rgb(0, 0, 0) 99.236%)",
        }}
      >
        {/* Монета */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Image
              src="/Coin_icon.png"
              alt="DurakCoin"
              width={220}
              height={220}
            />
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex flex-col space-y-4 mt-8 w-full">
          <button
            className="w-full py-3 border border-white text-white rounded-lg text-lg hover:bg-gray-700"
            onClick={searchGame}
          >
            search game
          </button>
          <button
            className="w-full py-3 border border-white text-white rounded-lg text-lg hover:bg-gray-700"
            onClick={createGame}
          >
            create game
          </button>
        </div>

        {/* Колода карт */}
        <div className="relative w-full mt-8 rounded-lg overflow-hidden border border-white">
      <div className="flex justify-center items-center p-6">
        <Image
          src="/deck.png"
          alt="Deck"
          width={100}
          height={100}
        />
      </div>
      {/* Кнопки внутри прямоугольника */}
      <div className="absolute bottom-2 right-2 flex space-x-5">
        <button className="px-2 py-1 border border-white text-sm rounded-full text-white bg-transparent hover:bg-gray-700">
          Choose deck
        </button>
        <button className="px-2 py-1 border border-white text-sm rounded-full text-white bg-transparent hover:bg-gray-700">
          Friends
        </button>
      </div>
    </div>
      </div>
      <BottomNavigation />
    </div>
  );
}

import { useRouter } from 'next/router';
import Image from "next/image";

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
      {/* Верхняя панель */}
      <div className="w-full bg-black py-4 px-4 flex items-center justify-between rounded-b-[15px] border-b border-white">
        {/* Левая часть */}
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
            {/* Аватар */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 15.75a4.5 4.5 0 11-7.5 0M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold">Mitrios</p>
            <p className="text-xs text-gray-400">bronze 1/10</p>
          </div>
        </div>

        {/* Средняя часть */}
        <div className="flex items-center text-sm">
          <span className="mr-1 text-gray-400">$</span>
          <p>31,234</p>
        </div>

        {/* Правая часть */}
        <div className="flex items-center space-x-4">
          {/* Бонус (PNG картинка) */}
          <div className="w-8 h-8">
            <Image
              src="/bonus-icon.png"
              alt="Bonus"
              width={32}
              height={32}
            />
          </div>
          {/* Уведомления (PNG картинка) */}
          <div className="w-8 h-8">
            <Image
              src="/notifications-icon.png"
              alt="Notifications"
              width={32}
              height={32}
            />
          </div>
        </div>
      </div>

      {/* Центральная часть */}
      <div
        className="flex-grow w-full px-4 pt-8 pb-16"
        style={{
          background:
            "linear-gradient(0.00deg, rgb(255, 255, 255), rgb(0, 0, 0), rgb(34, 34, 34) 30.16%, rgb(0, 0, 0) 99.236%)",
        }}
      >
        {/* Карточки */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Image
              src="/cards.png"
              alt="Cards"
              width={200}
              height={150}
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
        <div
          className="relative w-full mt-8 rounded-lg overflow-hidden border border-white"
          style={{
            backgroundImage: "url('/deck-background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex justify-center items-center p-6">
            <Image
              src="/deck.png"
              alt="Deck"
              width={100}
              height={100}
            />
          </div>
          {/* Кнопка внутри прямоугольника */}
          <button className="absolute bottom-2 right-2 px-3 py-1 border border-white text-sm rounded-full text-white bg-transparent hover:bg-gray-700">
            choose deck
          </button>
        </div>
      </div>

      {/* Нижняя навигация */}
      <div className="fixed bottom-0 left-0 right-0 bg-black py-2 border-t border-white">
        <div className="flex justify-around">
          <div className="flex flex-col items-center">
            <Image
              src="/home-icon.png"
              alt="Home"
              width={24}
              height={24}
            />
            <span className="text-xs mt-1 text-yellow-500">home</span>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src="/friends-icon.png"
              alt="Friends"
              width={24}
              height={24}
            />
            <span className="text-xs mt-1 text-gray-400">friends</span>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src="/rating-icon.png"
              alt="Rating"
              width={24}
              height={24}
            />
            <span className="text-xs mt-1 text-gray-400">rating</span>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src="/tournaments-icon.png"
              alt="Tournaments"
              width={24}
              height={24}
            />
            <span className="text-xs mt-1 text-gray-400">tournaments</span>
          </div>
        </div>
      </div>
    </div>
  );
}

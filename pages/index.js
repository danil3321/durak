import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-black text-white min-h-screen relative">
      {/* Верхняя панель */}
      <div className="relative flex items-center justify-between px-4 py-2 bg-black">
        {/* Левая часть */}
        <div className="flex items-center bg-blue-900 px-4 py-2 rounded-tr-full  z-10">
          <span className="text-xs text-white">bronze 1/10</span>
          <div className="ml-2 w-12 h-1 bg-gray-400 rounded-full relative">
            <div className="absolute top-0 left-0 w-4 h-1 bg-yellow-500 rounded-full"></div>
          </div>
        </div>

        {/* Центральная часть */}
        <div className="flex items-center justify-center bg-gray-700 w-[87px] h-[120px] rounded-lg z-20">
          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-black"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 15.75a4.5 4.5 0 11-7.5 0M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9z"
              />
            </svg>
          </div>
          <div className="ml-2 flex flex-col items-center">
            <span className="text-white text-sm">Mitrios</span>
            <span className="text-gray-300 text-xs">@9999</span>
          </div>
        </div>

        {/* Правая часть */}
        <div className="flex items-center bg-red-900 px-4 py-2 rounded-tl-full  z-10">
          <span className="text-xs text-white">75121</span>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex">
        {/* Левая панель */}
        <div className="flex flex-col items-center mt-8 ml-4 space-y-4">
          {/* Кнопка Invite */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
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
            <button className="px-4 py-1 bg-gray-700 rounded-lg text-sm">Invite</button>
          </div>

          {/* Повторяем Invite 4 раза */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
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
              <button className="px-4 py-1 bg-gray-700 rounded-lg text-sm">Invite</button>
            </div>
          ))}
        </div>

        {/* Центральный блок с кнопкой Play */}
        <div className="flex flex-col items-center mt-8 flex-1">
          <div className="bg-gray-800 w-40 h-40 rounded-full flex items-center justify-center">
            <Image
              src="/cards.png" // Замените на ваше изображение карт
              alt="Cards"
              width={80}
              height={80}
            />
          </div>
          <button className="mt-4 px-6 py-2 bg-gray-700 rounded-full text-lg">
            Play
          </button>
        </div>
      </div>

      {/* Секция Your Deck */}
      <div className="mt-12 px-4">
        <h2 className="text-lg mb-4">Your deck</h2>
        <div className="flex justify-center">
          <Image
            src="/deck.png" // Замените на ваше изображение колоды
            alt="Deck"
            width={100}
            height={100}
          />
        </div>
      </div>

      {/* Нижняя навигация */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-700 py-2">
        <div className="flex justify-around">
          <div className="flex flex-col items-center">
            <Image
              src="/home-icon.png" // Иконка дома
              alt="Home"
              width={24}
              height={24}
            />
            <span className="text-xs mt-1 text-yellow-500">home</span>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src="/friends-icon.png" // Иконка друзей
              alt="Friends"
              width={24}
              height={24}
            />
            <span className="text-xs mt-1 text-gray-400">friends</span>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src="/rating-icon.png" // Иконка рейтинга
              alt="Rating"
              width={24}
              height={24}
            />
            <span className="text-xs mt-1 text-gray-400">rating</span>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src="/tournaments-icon.png" // Иконка турниров
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



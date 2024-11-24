export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Верхний бар */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">bronze 1/10</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <span className="ml-2">Mitrios</span>
            <span className="ml-1">@9999</span>
          </div>
        </div>
        <span className="text-sm text-gray-300">75121</span>
      </div>

      {/* Основное содержимое */}
      <div className="px-4 py-8">
        {/* Левая панель */}
        <div className="flex flex-col items-center space-y-4 fixed left-2 top-1/4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <button className="text-xs px-2 py-1 bg-gray-600 rounded">Invite</button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-sm">+</span>
            </div>
            <button className="text-xs px-2 py-1 bg-gray-600 rounded">Invite</button>
          </div>
        </div>

        {/* Центральный блок */}
        <div className="flex flex-col items-center">
          <div className="rounded-full w-32 h-32 bg-gray-700 flex items-center justify-center mb-6">
            <img src="/cards.png" alt="cards" className="w-20 h-20" />
          </div>
          <button className="px-8 py-2 text-lg font-bold bg-gray-600 rounded-full">
            Play
          </button>
        </div>

        {/* Колода карт */}
        <div className="mt-10 text-center">
          <h2 className="text-lg font-semibold">Your deck</h2>
          <img src="/deck.png" alt="deck" className="w-24 mx-auto mt-4" />
        </div>
      </div>

      {/* Нижняя панель навигации */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 py-2 flex justify-around">
        <div className="text-center">
          <button className="text-yellow-500">🏠</button>
          <p className="text-xs">Home</p>
        </div>
        <div className="text-center">
          <button className="text-white">👥</button>
          <p className="text-xs">Friends</p>
        </div>
        <div className="text-center">
          <button className="text-white">🌐</button>
          <p className="text-xs">Rating</p>
        </div>
        <div className="text-center">
          <button className="text-white">🏆</button>
          <p className="text-xs">Tournaments</p>
        </div>
      </div>
    </div>
  );
}

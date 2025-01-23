import Image from "next/image";

export default function TopPanel() {
  return (
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
          <p className="text-sm font-semibold">MitriosCnage123</p>
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
  );
}

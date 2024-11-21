import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram) {
      const tg = window.Telegram.WebApp;
      tg.expand(); // Разворачиваем WebApp
    }
  }, []);

  const sendData = () => {
    const tg = window.Telegram.WebApp;
    tg.sendData(JSON.stringify({ message: "Привет от WebApp!" }));
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Добро пожаловать в WebApp</h1>
      <p className="text-lg mb-6">Это приложение открыто через Telegram.</p>
      <button
        onClick={sendData}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Отправить данные боту
      </button>
    </div>
  );
}

import Image from "next/image";
import { useRouter } from 'next/router';

export default function BottomNavigation() {
  const router = useRouter();
  const currentPath = router.pathname;

  const handleClick = (path) => {
    router.push(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black py-2 border-t border-white">
      <div className="flex justify-around">
        <div className="flex flex-col items-center" onClick={() => handleClick('/')}>
          <Image
            src={currentPath === '/' ? "/Active/Active_home.png" : "/Inactive/Inactive_home.png"}
            alt="Home"
            width={24}
            height={24}
          />
          <span className={`text-xs mt-1 ${currentPath === '/' ? 'text-yellow-500' : 'text-gray-400'}`}>Home</span>
        </div>
        <div className="flex flex-col items-center" onClick={() => handleClick('/')}>
          <Image
            src={currentPath === '/friends' ? "/Active/Active_rating.png" : "/Inactive/Inactive_rating.png"}
            alt="Rating"
            width={24}
            height={24}
          />
          <span className={`text-xs mt-1 ${currentPath === '/friends' ? 'text-yellow-500' : 'text-gray-400'}`}>Rating</span>
        </div>
        <div className="flex flex-col items-center" onClick={() => handleClick('/')}>
          <Image
            src={currentPath === '/rating' ? "/Active/Active_tur.png" : "/Inactive/Inactive_tur.png"}
            alt="Tournaments"
            width={24}
            height={24}
          />
          <span className={`text-xs mt-1 ${currentPath === '/rating' ? 'text-yellow-500' : 'text-gray-400'}`}>Tournaments</span>
        </div>
        <div className="flex flex-col items-center" onClick={() => handleClick('/')}>
          <Image
            src={currentPath === '/wallet' ? "/Active/Active_wallet.png" : "/Inactive/Inactive_wallet.png"}
            alt="Wallet"
            width={24}
            height={24}
          />
          <span className={`text-xs mt-1 ${currentPath === '/wallet' ? 'text-yellow-500' : 'text-gray-400'}`}>Wallet</span>
        </div>
      </div>
    </div>
  );
}

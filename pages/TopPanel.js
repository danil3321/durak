import Image from "next/image";

export default function TopPanel() {
  return (
    <div className="w-full bg-black py-4 px-4 flex items-center justify-center rounded-b-[15px] border-b border-white">
      {/* Центрированный контент */}
      <div className="text-center">
        <p className="text-[24px] font-light text-[rgb(215,220,224)] leading-[30px] tracking-[0px] font-quicksand mb-2">Mitrios</p>
        <p className="text-[16px] font-light text-[rgb(215,220,224)] leading-[20px] tracking-[0px] font-quicksand mt-2">bronze 1/10</p>
      </div>
    </div>
  );
}

import { RxHamburgerMenu } from "react-icons/rx";

export default function Header() {
  return (
    <header className="p-4 text-2xl py-4 bg-amber-200 flex flex-row gap-4 items-center">
      <div className="rounded-full p-2 hover:bg-gray-500 hover:text-white transition">
        <RxHamburgerMenu />
      </div>
      <h2 className="font-bold font-serif text-blue-400">LTK Food Company</h2>
    </header>
  );
}

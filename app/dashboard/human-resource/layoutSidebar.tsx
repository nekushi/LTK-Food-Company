"use client";

import Link from "next/link";

import { RxHamburgerMenu } from "react-icons/rx";
import { usePathname } from "next/navigation";

import { IoAnalytics, IoSettingsOutline } from "react-icons/io5";
import { IoIosGitBranch } from "react-icons/io";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { PiReceiptLight } from "react-icons/pi";
import { FaRegUser } from "react-icons/fa";

import { TypeNavList } from "@/index";

export default function LayoutSidebar() {
  const path = usePathname();

  return (
    <aside className="h-screen bg-blue-50 flex flex-col p-8 col-span-2">
      <div className="my-8 flex flex-col items-center gap-2">
        <div className="rounded-full border size-24 relative">
          <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl">
            HR
          </h1>
        </div>
        <h4 className="text-xl text-center">Jane Doe</h4> {/* hard coded */}
      </div>
      <section className="mb-16">
        <ul className="space-y-2">
          {navLists.map((navList: TypeNavList) => {
            const isActive = path === navList.href;

            return (
              <li
                key={navList.name}
                className={`transition hover:text-md hover:bg-blue-100 px-2 py-1 rounded-md origin-left ${
                  isActive && "text-blue-500 font-bold text-lg"
                }`}
              >
                <Link href={navList.href} className="block">
                  <div className="flex flex-row gap-2 items-center">
                    {navList.icon} {navList.name}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      <button className="py-2 rounded-md font-medium bg-blue-100 hover:bg-blue-200 active:bg-blue-300">
        Log Out
      </button>
    </aside>
  );
}

const navLists: TypeNavList[] = [
  {
    name: "Dashboard",
    href: "/dashboard/human-resource",
    icon: <IoAnalytics />,
  },
  {
    name: "Employee",
    href: "/dashboard/human-resource/employee",
    icon: <FaRegUser />,
  },
  {
    name: "Payroll",
    href: "/dashboard/human-resource/payroll",
    icon: <PiReceiptLight />,
  },
  { name: "Schedule", href: "", icon: <RiCalendarScheduleLine /> },
  { name: "Department", href: "", icon: <IoIosGitBranch /> },
  { name: "Settings", href: "", icon: <IoSettingsOutline /> },
] as const;

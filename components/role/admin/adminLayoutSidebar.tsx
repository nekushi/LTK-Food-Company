"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { IoAnalytics } from "react-icons/io5";
import { IoIosGitBranch } from "react-icons/io";
import { FaRegUser } from "react-icons/fa";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { HiOutlineChevronDown, HiOutlineChevronRight } from "react-icons/hi";

import { TypeNavList } from "@/index";
import BtnLogout from "@/components/logouts/btnLogout";

interface NavItemGroup {
  name: string;
  icon: React.ReactNode;
  children: { name: string; href: string }[];
}

export default function AdminLayoutSidebar() {
  const path = usePathname();

  // State for expanded menus
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Branch: true,
    Personnel: true,
    Employee: true,
  });

  const toggleExpand = (menuName: string) => {
    setExpanded((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const navGroups: NavItemGroup[] = [
    {
      name: "Branch",
      icon: <IoIosGitBranch />,
      children: [
        { name: "Overview", href: "/admin/branch" },
        { name: "Inventory", href: "/admin/branch/inventory" },
        { name: "Requests & Approvals", href: "/admin/branch/requests" },
      ],
    },
    {
      name: "Personnel",
      icon: <MdOutlinePeopleAlt />,
      children: [
        { name: "HR", href: "/admin/personnel/hr" },
        { name: "Branch Managers", href: "/admin/personnel/branch-managers" },
        { name: "Staff", href: "/admin/personnel/staff" },
      ],
    },
    {
      name: "Reports",
      icon: <IoAnalytics />,
      children: [
        { name: "Custom Reports", href: "/admin/reports/custom" },
        { name: "Sales Reports", href: "/admin/reports/sales" },
        { name: "Inventory Reports", href: "/admin/reports/inventory" },
        { name: "Staff Performance", href: "/admin/reports/staff-performance" },
        { name: "Compliance Reports", href: "/admin/reports/compliance" },
      ],
    },
    {
      name: "Settings",
      icon: <FaRegUser />,
      children: [
        { name: "Admin Accounts", href: "/admin/settings/accounts" },
        {
          name: "Branch Registration",
          href: "/admin/settings/branch-registration",
        },
        { name: "System Config", href: "/admin/settings/system-config" },
      ],
    },
  ];

  return (
    <aside className="h-full bg-amber-50 flex flex-col p-6 col-span-2 overflow-y-auto w-full border-r border-amber-200">
      <div className="my-6 flex flex-col items-center gap-2">
        <div className="rounded-full border border-amber-300 size-20 relative bg-white shadow-sm flex items-center justify-center text-amber-900">
          <h1 className="text-3xl font-bold">AD</h1>
        </div>
        <h4 className="text-lg font-medium text-amber-900 text-center">
          Admin User
        </h4>
      </div>

      <section className="mb-8 flex-1">
        <ul className="space-y-4 text-amber-900">
          {/* Dashboard Link directly outside groups */}
          <li>
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                path === "/admin"
                  ? "bg-amber-200 font-semibold text-amber-900"
                  : "hover:bg-amber-100"
              }`}
            >
              <IoAnalytics className="text-xl" />
              <span>Dashboard</span>
            </Link>
          </li>

          {/* Grouped Links */}
          {navGroups.map((group) => (
            <li key={group.name} className="pt-2">
              <button
                onClick={() => toggleExpand(group.name)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold uppercase tracking-wider text-amber-800/80 hover:bg-amber-100/50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2 text-amber-900">
                  {group.icon}
                  {group.name}
                </div>
                {expanded[group.name] ? (
                  <HiOutlineChevronDown className="text-amber-700" />
                ) : (
                  <HiOutlineChevronRight className="text-amber-700" />
                )}
              </button>

              {expanded[group.name] && (
                <ul className="mt-1 space-y-1 pl-8">
                  {group.children.map((child) => {
                    const isActive =
                      path === child.href || path.startsWith(`${child.href}/`);
                    return (
                      <li key={child.name}>
                        <Link
                          href={child.href}
                          className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            isActive
                              ? "bg-amber-200/70 font-medium text-amber-900"
                              : "text-amber-700 hover:bg-amber-100 hover:text-amber-900"
                          }`}
                        >
                          {child.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-auto">
        <BtnLogout />
      </div>
    </aside>
  );
}

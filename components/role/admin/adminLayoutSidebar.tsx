"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { IoAnalytics } from "react-icons/io5";
import { IoIosGitBranch } from "react-icons/io";
import { FaRegUser } from "react-icons/fa";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { HiOutlineChevronDown, HiOutlineChevronRight } from "react-icons/hi";

import BtnLogout from "@/components/logouts/btnLogout";
import { getAuth } from "@/lib/auth-storage";

interface NavItemGroup {
  name: string;
  icon: React.ReactNode;
  children: { name: string; href: string }[];
}

interface BranchStoreNav {
  id: string;
  storeName: string;
}

export default function AdminLayoutSidebar() {
  const path = usePathname();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    setFirstName(getAuth("firstName") || "");
    setLastName(getAuth("lastName") || "");
  }, []);

  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "AD";
  const fullName = `${firstName} ${lastName}`.trim() || "Admin";

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "Branch MGT": false,
    "Personnel MGT": false,
  });
  const [branchStores, setBranchStores] = useState<BranchStoreNav[]>([]);

  useEffect(() => {
    async function fetchStores() {
      try {
        const res = await fetch("/api/admin/stores");
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setBranchStores(
            json.data.map((s: { id: string; storeName: string }) => ({
              id: s.id,
              storeName: s.storeName,
            })),
          );
        }
      } catch (error) {
        console.error("Failed to load admin stores for sidebar", error);
      }
    }
    fetchStores();
  }, []);

  const toggleExpand = (menuName: string) => {
    setExpanded((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const navGroups: NavItemGroup[] = [
    {
      name: "Branch MGT",
      icon: <IoIosGitBranch />,
      children: [],
    },
    {
      name: "Personnel MGT",
      icon: <MdOutlinePeopleAlt />,
      children: [
        { name: "User Info", href: "/admin/personnel/admin-info" },
        { name: "Employee Records", href: "/admin/personnel/employee-records" },
        // { name: "Attendance", href: "/admin/personnel/attendance" },
        // { name: "Payroll", href: "/admin/personnel/payroll" },
      ],
    },
    {
      name: "Inventory MGT",
      icon: <IoAnalytics />,
      children: [
        { name: "Item List", href: "/admin/inventory/item-list" },
        // { name: "Item Request", href: "/admin/inventory/item-request" },
        {
          name: "Initial Stock Allocation",
          href: "/admin/inventory/initial-stock-allocation",
        },
      ],
    },
    // {
    //   name: "Reports",
    //   icon: <IoAnalytics />,
    //   children: [
    //     { name: "Sales Reports", href: "/admin/reports/sales" },
    //     { name: "Inventory Reports", href: "/admin/reports/inventory" },
    //     { name: "Delivery Reports", href: "/admin/reports/delivery" },
    //   ],
    // },
    // {
    //   name: "Settings",
    //   icon: <FaRegUser />,
    //   children: [
    //     { name: "Admin Accounts", href: "/admin/settings/accounts" },
    //     {
    //       name: "Branch Registration",
    //       href: "/admin/settings/branch-registration",
    //     },
    //     { name: "System Config", href: "/admin/settings/system-config" },
    //   ],
    // },
  ];

  return (
    <aside className="h-full bg-amber-50 flex flex-col col-span-2 overflow-y-auto border-r border-amber-200">
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-sm font-bold font-serif text-amber-800 tracking-wide">
          LTK Food Company
        </h2>
      </div>

      <div className="px-5 py-4 flex items-center gap-3 border-b border-amber-200">
        <div className="rounded-full bg-amber-700 text-white size-10 flex items-center justify-center text-sm font-bold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-900 truncate">
            {fullName}
          </p>
          <p className="text-[11px] text-amber-600">Admin</p>
        </div>
      </div>

      <nav className="px-3 py-4 space-y-1">
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            path === "/admin"
              ? "bg-amber-200 font-semibold text-amber-900"
              : "text-amber-800 hover:bg-amber-100"
          }`}
        >
          <IoAnalytics className="text-lg" />
          Dashboard
        </Link>
        <Link
          href="/admin/delivery"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            path === "/admin/delivery"
              ? "bg-amber-200 font-semibold text-amber-900"
              : "text-amber-800 hover:bg-amber-100"
          }`}
        >
          <IoIosGitBranch className="text-lg" />
          Delivery View
        </Link>

        {navGroups.map((group) => (
          <div key={group.name} className="pt-2">
            <button
              onClick={() => toggleExpand(group.name)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-amber-700 hover:bg-amber-100/50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                {group.icon}
                {group.name}
              </div>
              {expanded[group.name] ? (
                <HiOutlineChevronDown className="text-amber-600" />
              ) : (
                <HiOutlineChevronRight className="text-amber-600" />
              )}
            </button>

            {expanded[group.name] && (
              <ul className="mt-1 space-y-0.5 pl-7">
                {(group.name === "Branch MGT"
                  ? branchStores.map((s) => ({
                      name: s.storeName,
                      href: `/admin/branch/manage/${s.id}`,
                    }))
                  : group.children
                ).map((child) => {
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
            {/* <Link
              href="/admin/inventory/item-list"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                path === "/admin"
                  ? "bg-amber-200 font-semibold text-amber-900"
                  : "text-amber-800 hover:bg-amber-100"
              }`}
            >
              <IoAnalytics className="text-lg" />
              Item List
            </Link> */}
          </div>
        ))}
        <Link
          href="/admin/inventory/item-request"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            path === "/admin/inventory/item-request"
              ? "bg-amber-200 font-semibold text-amber-900"
              : "text-amber-800 hover:bg-amber-100"
          }`}
        >
          <IoAnalytics className="text-lg" />
          Item Requests
        </Link>
      </nav>

      <div className="px-3 mt-8">
        <BtnLogout />
      </div>
    </aside>
  );
}

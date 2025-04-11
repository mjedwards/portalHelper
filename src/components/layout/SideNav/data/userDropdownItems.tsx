/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

// Define interface for user dropdown menu item
export interface UserDropdownItem {
  href: string;
  label: string;
  onClick?: () => void;
}

// User dropdown menu items
const userDropdownItems: UserDropdownItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard"
  },
  {
    href: "/settings",
    label: "Settings"
  },
  {
    href: "/profile",
    label: "Profile"
  },
  {
    href: "/logout",
    label: "Sign out"
  }
];

export default userDropdownItems;
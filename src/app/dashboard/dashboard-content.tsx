"use client";

import { useState } from "react";
import { ActiveLoans } from "./active-loans";
import { ClaimsList } from "./claims-list";

export function DashboardContent() {
  const [hasLoans, setHasLoans] = useState(false);

  return (
    <>
      <ActiveLoans onHasLoans={setHasLoans} />
      {!hasLoans && <ClaimsList />}
    </>
  );
}

"use client";

import Image from "next/image";

export function BrandMark() {
  return (
    <Image
      src="/logos/logo-strax-dark.png"
      alt="STRAX"
      width={160}
      height={40}
      className="h-10 w-auto"
      priority
    />
  );
}

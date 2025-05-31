'use client'

import Image from 'next/image'
import type { ComponentProps } from 'react'

export function Logo(
  props: Omit<ComponentProps<typeof Image>, 'src' | 'alt' | 'width' | 'height'>
) {
  return (
    <Image
  src="/icons/assets/logo.png"  // ✅ path from public/
  alt="Talkzii Logo"
  width={150}
  height={50}
/>

  )
}

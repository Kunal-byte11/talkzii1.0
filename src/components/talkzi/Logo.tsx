
'use client'

import Image from 'next/image'
import type { ComponentProps } from 'react'

export function Logo(
  props: Omit<ComponentProps<typeof Image>, 'src' | 'alt' | 'width' | 'height'> & { width?: number; height?: number }
) {
  const { width, height, ...rest } = props;
  return (
    <Image
      src="/icons/assets/logo1.png"
      alt="Talkzii Logo"
      width={width || 150} // Use passed width or default
      height={height || 50} // Use passed height or default
      {...rest} // Spread remaining props, including className
    />
  )
}

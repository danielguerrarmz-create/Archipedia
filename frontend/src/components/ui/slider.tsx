"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider@1.2.3";

import { cn } from "./utils";

/*
 * Concrete & Signal slider.
 * Track: debossed well. Range: signal fill. Thumb: node-square (radius-sm) + emboss.
 */

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  style,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50",
        className,
      )}
      style={style}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        style={{
          position: "relative",
          flexGrow: 1,
          height: 6,
          borderRadius: "var(--radius-pill)",
          background: "var(--concrete-sunken)",
          boxShadow: "var(--deboss)",
          overflow: "visible",
        }}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          style={{
            position: "absolute",
            height: "100%",
            borderRadius: "var(--radius-pill)",
            background: "var(--signal)",
          }}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          style={{
            display: "block",
            width: 16,
            height: 16,
            borderRadius: "var(--radius-sm)",
            background: "var(--concrete-0)",
            boxShadow: "var(--emboss)",
            border: "none",
            outline: "none",
            cursor: "pointer",
            transition: "box-shadow var(--dur-1) var(--ease-press)",
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "var(--emboss), 0 0 0 3px var(--focus-ring)";
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "var(--emboss)";
          }}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };

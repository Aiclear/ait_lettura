import clsx from "clsx";
import { useHotkeys } from "react-hotkeys-hook";
import React, { useImperativeHandle, useRef } from "react";

export interface ScrollBoxRefObject {
  scrollToTop: () => void;
  getScrollPosition: () => number;
  scrollToPosition: (position: number) => void;
}

export interface ScrollBoxProps {
  children: React.ReactNode;
  className?: string;
  ref?: React.Ref<any>;
}

export const ScrollBox = React.forwardRef((props: ScrollBoxProps, ref: any) => {
  const { className, children } = props;
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop += 100;
    }
  };

  const scrollUp = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop -= 100;
    }
  };

  const scrollToTop = () => {
    if (scrollRef.current !== null) {
      scrollRef.current.scroll(0, 0);
    }
  };

  const getScrollPosition = () => {
    if (scrollRef.current) {
      return scrollRef.current.scrollTop;
    }
    return 0;
  };

  const scrollToPosition = (position: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = position;
    }
  };

  useImperativeHandle(ref, () => {
    return {
      scrollToTop,
      getScrollPosition,
      scrollToPosition,
    };
  });

  useHotkeys("j", scrollDown);
  useHotkeys("k", scrollUp);

  return (
    <div className={clsx("overflow-y-auto", className)} ref={scrollRef}>
      {children}
    </div>
  );
});

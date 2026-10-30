'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { formatRupiah } from '@arus/core';
import { Icon, categoryIcon } from '@/components/ui/Icon';
import type { CategoryTotal } from '../summary';

interface CategoryCardsProps {
  categories: CategoryTotal[];
  rangeQuery: string;
}

const THROW_DISTANCE = 90;
const TAP_TOLERANCE = 6;
const FLY_MS = 380;
const TUCK_MS = 900;
const VISIBLE_BEHIND = 3;

const settle =
  'transform 860ms var(--ease-soft), opacity 640ms var(--ease-soft), filter 640ms ease';

export function CategoryCards({ categories, rangeQuery }: CategoryCardsProps) {
  const count = categories.length;
  const [front, setFront] = useState(0);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [tucked, setTucked] = useState<number | null>(null);
  const gesture = useRef({ startX: 0, moved: false, pointerId: 0 });
  const flyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const tuckTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      clearTimeout(flyTimer.current);
      clearTimeout(tuckTimer.current);
    },
    [],
  );

  if (count === 0) {
    return (
      <div className="empty" style={{ padding: '32px 8px' }}>
        <div className="empty__title">Belum ada transaksi</div>
        <p className="ar-hint">Kartu kategori muncul setelah ada transaksi di rentang ini.</p>
      </div>
    );
  }

  const current = Math.min(front, count - 1);
  const go = (index: number) => {
    setFront(((index % count) + count) % count);
    setDx(0);
    setDragging(false);
  };

  const fly = (direction: 1 | -1) => {
    if (flyTimer.current) return;
    if (count < 2) return go(current);
    setDragging(false);
    setDx(direction * 440);
    flyTimer.current = setTimeout(() => {
      flyTimer.current = undefined;
      setFront((current + 1) % count);
      setDx(0);
      setTucked(current);
      clearTimeout(tuckTimer.current);
      tuckTimer.current = setTimeout(() => setTucked(null), TUCK_MS);
    }, FLY_MS);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    gesture.current = { startX: event.clientX, moved: false, pointerId: event.pointerId };
    setDragging(true);
    setDx(0);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const distance = event.clientX - gesture.current.startX;
    if (!gesture.current.moved && Math.abs(distance) > TAP_TOLERANCE) {
      gesture.current.moved = true;
      event.currentTarget.setPointerCapture(gesture.current.pointerId);
    }
    if (gesture.current.moved) setDx(distance);
  };

  const onPointerUp = () => {
    if (!dragging) return;
    if (Math.abs(dx) > THROW_DISTANCE) fly(dx > 0 ? 1 : -1);
    else {
      setDragging(false);
      setDx(0);
    }
  };

  const pull = Math.min(Math.abs(dx) / 240, 1);
  const focused = categories[current]!;

  return (
    <>
      <div
        className="ar-cards"
        tabIndex={0}
        role="group"
        aria-roledescription="tumpukan kartu"
        aria-label="Masuk dan keluar per kategori"
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') fly(1);
          else if (event.key === 'ArrowLeft') go(current - 1);
          else return;
          event.preventDefault();
        }}
      >
        {categories.map((category, index) => {
          const position = (index - current + count) % count;
          const isFront = position === 0;
          const isTucked = tucked === index && !isFront;
          const depth = isFront
            ? 0
            : isTucked
              ? VISIBLE_BEHIND
              : Math.max(
                  0,
                  Math.min(position, VISIBLE_BEHIND) - (position <= VISIBLE_BEHIND ? pull : 0),
                );
          const style: CSSProperties & Record<string, string | number> = {
            '--from': category.colorFrom,
            '--to': category.colorTo,
            zIndex: isTucked ? 0 : count - position,
            opacity: position > VISIBLE_BEHIND && !isTucked ? 0 : 1,
            filter: `brightness(${(1 - 0.08 * depth).toFixed(3)})`,
            boxShadow: `0 18px 40px rgba(10, 20, 18, ${isFront ? 0.28 : 0.14})`,
            cursor: isFront ? (dragging ? 'grabbing' : 'grab') : 'default',
            transform: isFront
              ? `translate3d(${dx}px, ${(-Math.abs(dx) * 0.04).toFixed(1)}px, 0) rotate(${(dx / 34).toFixed(2)}deg) scale(${dragging ? 1.02 : 1})`
              : `translate3d(0, ${(-18 * depth).toFixed(1)}px, 0) scale(${(1 - 0.06 * depth).toFixed(3)})`,
            transition: dragging
              ? isFront
                ? 'none'
                : 'transform 160ms linear, filter 160ms linear'
              : settle,
          };
          const href = `/transaksi?${rangeQuery}${rangeQuery ? '&' : ''}kategori=${category.id}&asal=kartu`;

          return (
            <div
              key={category.id}
              className="ar-atm"
              aria-hidden={!isFront}
              style={style}
              onPointerDown={isFront ? onPointerDown : undefined}
              onPointerMove={isFront ? onPointerMove : undefined}
              onPointerUp={isFront ? onPointerUp : undefined}
              onPointerCancel={isFront ? onPointerUp : undefined}
            >
              <span className="ar-atm__shine" />
              {isFront && (
                <Link
                  href={href}
                  className="ar-atm__link"
                  draggable={false}
                  aria-label={`Lihat transaksi ${category.name}`}
                  onClick={(event) => gesture.current.moved && event.preventDefault()}
                />
              )}
              <span className="ar-atm__pill" style={{ top: 22, right: 22, width: 64 }} />
              <span className="ar-atm__pill" style={{ top: 38, right: 46, width: 40 }} />
              <span className="ar-atm__pill" style={{ top: 54, right: 22, width: 88 }} />
              <div className="ar-atm__row">
                <span className="ar-atm__icon">
                  <Icon name={categoryIcon(category.name)} />
                </span>
                <span className="ar-atm__name">{category.name}</span>
                <span className="ar-atm__more">Lihat ›</span>
              </div>
              <div className="ar-atm__row ar-atm__row--wide">
                <span className="ar-atm__chip" />
                <span className="ar-atm__number">
                  •••• {String(category.activeDays).padStart(2, '0')} hari
                </span>
              </div>
              <div className="ar-atm__totals">
                <div>
                  <div className="ar-atm__caption">Masuk</div>
                  <div className="ar-atm__amount">
                    {category.totalIn ? formatRupiah(category.totalIn, 'in') : 'Rp0'}
                  </div>
                </div>
                <div>
                  <div className="ar-atm__caption">Keluar</div>
                  <div className="ar-atm__amount">
                    {category.totalOut ? formatRupiah(category.totalOut, 'out') : 'Rp0'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="ar-cards__controls">
        <button
          type="button"
          className="ar-btn ar-btn--icon ar-btn--sm"
          aria-label="Kartu sebelumnya"
          onClick={() => go(current - 1)}
        >
          <Icon name="chevronLeft" />
        </button>
        <div className="ar-cards__dots">
          {categories.map((category, index) => (
            <button
              key={category.id}
              type="button"
              className="ar-dot"
              aria-label={category.name}
              aria-current={index === current}
              onClick={() => go(index)}
            />
          ))}
        </div>
        <button
          type="button"
          className="ar-btn ar-btn--icon ar-btn--sm"
          aria-label="Kartu berikutnya"
          onClick={() => fly(1)}
        >
          <Icon name="chevronRight" />
        </button>
      </div>
      <p className="ar-hint ar-cards__note" aria-live="polite">
        {focused.name} · {current + 1} dari {count} · ada transaksi di {focused.activeDays} hari
      </p>
    </>
  );
}

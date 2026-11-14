/*
 * Interactive keyboard, adapted from VengeanceUI "interactive-keyboard".
 * Copyright (c) 2025-2026 Ashutoshx7. MIT License, full text in /licenses/VengeanceUI-MIT.txt.
 *
 * Changes from the original: listens to the physical keyboard while `active` (the section is on screen)
 * instead of while hovered; Tab, modifier shortcuts and Enter/Space on a focused control pass through;
 * styles live in src/styles/global.css (themed), so the inline <style>, cn() and Tailwind classes are gone.
 */
import { useEffect, useState } from "react";

const KEY_CODE_MAP: Record<string, string> = {
  Escape: "esc",
  F1: "f1", F2: "f2", F3: "f3", F4: "f4", F5: "f5", F6: "f6",
  F7: "f7", F8: "f8", F9: "f9", F10: "f10", F11: "f11", F12: "f12",
  F13: "f13", F14: "f14", F15: "f15", F16: "f16", F17: "f17", F18: "f18", F19: "f19",
  Backquote: "`", Digit1: "1", Digit2: "2", Digit3: "3", Digit4: "4", Digit5: "5",
  Digit6: "6", Digit7: "7", Digit8: "8", Digit9: "9", Digit0: "0",
  Minus: "-", Equal: "=", Backspace: "delete",
  Tab: "tab", KeyQ: "q", KeyW: "w", KeyE: "e", KeyR: "r", KeyT: "t", KeyY: "y",
  KeyU: "u", KeyI: "i", KeyO: "o", KeyP: "p",
  BracketLeft: "[", BracketRight: "]", Backslash: "\\",
  CapsLock: "caps lock", KeyA: "a", KeyS: "s", KeyD: "d", KeyF: "f", KeyG: "g",
  KeyH: "h", KeyJ: "j", KeyK: "k", KeyL: "l", Semicolon: ";", Quote: "'", Enter: "return",
  ShiftLeft: "shift", ShiftRight: "shift", KeyZ: "z", KeyX: "x", KeyC: "c", KeyV: "v",
  KeyB: "b", KeyN: "n", KeyM: "m", Comma: ",", Period: ".", Slash: "/",
  ControlLeft: "control", ControlRight: "control",
  AltLeft: "option", AltRight: "option",
  MetaLeft: "command", MetaRight: "command",
  Space: "space",
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  Home: "home", End: "end", PageUp: "page up", PageDown: "page down",
  Delete: "forward delete", NumLock: "clear",
  NumpadEqual: "=", NumpadDivide: "/", NumpadMultiply: "*",
  NumpadSubtract: "numpad -", NumpadAdd: "numpad +", NumpadEnter: "numpad enter",
  Numpad1: "numpad 1", Numpad2: "numpad 2", Numpad3: "numpad 3", Numpad4: "numpad 4",
  Numpad5: "numpad 5", Numpad6: "numpad 6", Numpad7: "numpad 7", Numpad8: "numpad 8",
  Numpad9: "numpad 9", Numpad0: "numpad 0", NumpadDecimal: "numpad .",
};


const PREVENT_DEFAULT_KEYS = new Set([
  "space", "up", "down", "left", "right",
  "page up", "page down", "home", "end", "delete",
]);

function isEditableTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT");
}

export interface InteractiveKeyboardProps {
  /** Physical key presses are mirrored only while true. */
  active?: boolean;
  /** A key was clicked or tapped on screen. */
  onKeyClick?: (key: string) => void;
  /** A physical key was pressed while active. */
  onKeyPress?: (key: string) => void;
}

export function InteractiveKeyboard({ active = false, onKeyClick, onKeyPress }: InteractiveKeyboardProps) {
  const [capsLock, setCapsLock] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!active) { setPressedKeys(new Set()); return; }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target) || event.ctrlKey || event.metaKey || event.altKey) return;
      const keyName = KEY_CODE_MAP[event.code];
      if (!keyName || keyName === "tab") return;
      const onControl = (event.target as HTMLElement | null)?.closest?.("a,button");
      if (onControl && (keyName === "return" || keyName === "space")) return;
      if (PREVENT_DEFAULT_KEYS.has(keyName)) event.preventDefault();
      if (event.repeat) return;
      if (keyName === "caps lock") {
        setCapsLock(event.getModifierState("CapsLock"));
      } else {
        setPressedKeys((prev) => new Set(prev).add(keyName));
      }
      onKeyPress?.(keyName);
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      const keyName = KEY_CODE_MAP[event.code];
      if (!keyName) return;
      setPressedKeys((prev) => {
        // macOS swallows keyup events while command is held, so releasing command clears everything
        if (keyName === "command") return new Set();
        if (!prev.has(keyName)) return prev;
        const next = new Set(prev);
        next.delete(keyName);
        return next;
      });
    };
    const handleBlur = () => setPressedKeys(new Set());
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [active, onKeyPress]);

  const handleKeyClick = (keyName: string) => {
    if (keyName === "caps lock") setCapsLock(!capsLock);
    onKeyClick?.(keyName);
  };

  const keyProps = (keyName: string) => ({
    onClick: () => handleKeyClick(keyName),
    "data-pressed": pressedKeys.has(keyName) || undefined,
  });

  return (
    <div className="ikb">
    <div className="ikb-keyboard" role="group" aria-label="On-screen keyboard">
      <div className="ikb-row">
        <button type="button" className="ikb-btn-0" {...keyProps("esc")}><span className="ikb-xs">esc</span></button>
        <button type="button" className="ikb-btn-0" {...keyProps("f1")}><span className="ikb-xs ikb-noxscale"><span className="ikb-emoji">&#128261;</span></span><span className="ikb-lr ikb-xxxs">F1</span></button>
        <button type="button" className="ikb-btn-0" {...keyProps("f2")}><span className="ikb-xs ikb-noxscale"><span className="ikb-emoji">&#128262;</span></span><span className="ikb-lr ikb-xxxs">F2</span></button>
        <button type="button" className="ikb-btn-0" {...keyProps("f3")}><span className="ikb-xs ikb-noxscale"><span className="ikb-cascade"></span><span className="ikb-block"></span></span><span className="ikb-lr ikb-xxxs">F3</span></button>
        <button type="button" className="ikb-btn-0" {...keyProps("f4")}><span className="ikb-xxxs ikb-noxscale"><span className="ikb-apps"></span></span><span className="ikb-lr ikb-xxxs">F4</span></button>
        <button type="button" className="ikb-btn-0" {...keyProps("f5")}><span className="ikb-lr ikb-xxxs">F5</span></button>
        <button type="button" className="ikb-btn-0" {...keyProps("f6")}><span className="ikb-lr ikb-xxxs">F6</span></button>
        <button type="button" className="ikb-btn-0" {...keyProps("f7")}><span className="ikb-sm"><span className="ikb-left"></span><span className="ikb-left"></span></span><span className="ikb-lr ikb-xxxs">F7</span></button>
        <button type="button" className="ikb-btn-0" {...keyProps("f8")}><span className="ikb-sm"><span className="ikb-right"></span><span className="ikb-pause"></span></span><span className="ikb-lr ikb-xxxs">F8</span></button>
        <button type="button" className="ikb-btn-0" {...keyProps("f9")}><span className="ikb-sm"><span className="ikb-right"></span><span className="ikb-right"></span></span><span className="ikb-lr ikb-xxxs">F9</span></button>
        <button type="button" className="ikb-btn-0" {...keyProps("f10")}><span className="ikb-xs ikb-noxscale"><span className="ikb-emoji">&#128264;</span></span><span className="ikb-lr ikb-xxxs">F10</span></button>
        <button type="button" className="ikb-btn-0" {...keyProps("f11")}><span className="ikb-xs ikb-noxscale"><span className="ikb-emoji">&#128265;</span></span><span className="ikb-lr ikb-xxxs">F11</span></button>
        <button type="button" className="ikb-btn-0" {...keyProps("f12")}><span className="ikb-xs ikb-noxscale"><span className="ikb-emoji">&#128266;</span></span><span className="ikb-lr ikb-xxxs">F12</span></button>
        <button type="button" className="ikb-btn-0" {...keyProps("eject")}><span className="ikb-xs ikb-noxscale">⏏</span></button>
      </div>
      <div className="ikb-row">
        <button type="button" className="ikb-btn-1" {...keyProps("f13")}><span className="ikb-lr ikb-xxxs">F13</span></button>
        <button type="button" className="ikb-btn-1" {...keyProps("f14")}><span className="ikb-lr ikb-xxxs">F14</span></button>
        <button type="button" className="ikb-btn-1" {...keyProps("f15")}><span className="ikb-lr ikb-xxxs">F15</span></button>
      </div>
      <div className="ikb-row">
        <button type="button" className="ikb-btn-1" {...keyProps("f16")}><span className="ikb-lr ikb-xxxs">F16</span></button>
        <button type="button" className="ikb-btn-1" {...keyProps("f17")}><span className="ikb-lr ikb-xxxs">F17</span></button>
        <button type="button" className="ikb-btn-1" {...keyProps("f18")}><span className="ikb-lr ikb-xxxs">F18</span></button>
        <button type="button" className="ikb-btn-1" {...keyProps("f19")}><span className="ikb-lr ikb-xxxs">F19</span></button>
      </div>
      <div className="ikb-row">
        <button type="button" className="ikb-btn-2" {...keyProps("`")}><span className="ikb-sm">~<br/>`</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("1")}><span className="ikb-sm">!<br/>1</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("2")}><span className="ikb-sm">@<br/>2</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("3")}><span className="ikb-sm">#<br/>3</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("4")}><span className="ikb-sm">$<br/>4</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("5")}><span className="ikb-sm">%<br/>5</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("6")}><span className="ikb-sm">^<br/>6</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("7")}><span className="ikb-sm">&amp;<br/>7</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("8")}><span className="ikb-sm">*<br/>8</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("9")}><span className="ikb-sm">(<br/>9</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("0")}><span className="ikb-sm">)<br/>0</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("-")}><span className="ikb-sm">_<br/>-</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("=")}><span className="ikb-sm">+<br/>=</span></button>
        <button type="button" className="ikb-btn-3" {...keyProps("delete")}><span className="ikb-lr ikb-xs">delete</span></button>
      </div>
      <div className="ikb-row">
        <button type="button" className="ikb-btn-2" {...keyProps("fn")}><span className="ikb-xs">fn</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("home")}><span className="ikb-xs">home</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("page up")}><span className="ikb-xs">page up</span></button>
      </div>
      <div className="ikb-row">
        <button type="button" className="ikb-btn-2" {...keyProps("clear")}><span className="ikb-xs">clear</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("=")}><span>=</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("/")}><span>/</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("*")}><span>*</span></button>
      </div>
      <div className="ikb-row">
        <button type="button" className="ikb-btn-3" {...keyProps("tab")}><span className="ikb-ll ikb-xs">tab</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("q")}><span>Q</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("w")}><span>W</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("e")}><span>E</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("r")}><span>R</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("t")}><span>T</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("y")}><span>Y</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("u")}><span>U</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("i")}><span>I</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("o")}><span>O</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("p")}><span>P</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("[")}><span className="ikb-sm">&#123;<br/>[</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("]")}><span className="ikb-sm">&#125;<br/>]</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("\\")}><span className="ikb-sm">|<br/>\</span></button>
      </div>
      <div className="ikb-row">
        <button type="button" className="ikb-btn-2" {...keyProps("forward delete")}>
          <span className="ikb-xs ikb-col">
            <span>del</span>
            <span className="ikb-big">⌦</span>
          </span>
        </button>
        <button type="button" className="ikb-btn-2" {...keyProps("end")}><span className="ikb-xs">end</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("page down")}><span className="ikb-xs">page down</span></button>
      </div>
      <div className="ikb-row">
        <button type="button" className="ikb-btn-2" {...keyProps("numpad 7")}><span>7</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("numpad 8")}><span>8</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("numpad 9")}><span>9</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("numpad -")}><span>-</span></button>
      </div>
      <div className="ikb-row">
        <button type="button" className="ikb-btn-4" aria-pressed={capsLock} {...keyProps("caps lock")}>
          <span className="ikb-ul ikb-xs dot-light" aria-hidden="true">•</span>
          <span className="ikb-ll ikb-xs">caps lock</span>
        </button>
        <button type="button" className="ikb-btn-2" {...keyProps("a")}><span>A</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("s")}><span>S</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("d")}><span>D</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("f")}><span>F</span><span className="ikb-bump"></span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("g")}><span>G</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("h")}><span>H</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("j")}><span>J</span><span className="ikb-bump"></span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("k")}><span>K</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("l")}><span>L</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps(";")}><span className="ikb-sm">:<br/>;</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("'")}><span className="ikb-sm">&quot;<br/>&#39;</span></button>
        <button type="button" className="ikb-btn-4" {...keyProps("return")}><span className="ikb-lr ikb-xs">return</span></button>
      </div>
      <div className="ikb-row"></div>
      <div className="ikb-row">
        <button type="button" className="ikb-btn-2" {...keyProps("numpad 4")}><span>4</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("numpad 5")}><span>5</span><span className="ikb-bump"></span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("numpad 6")}><span>6</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("numpad +")}><span>+</span></button>
      </div>
      <div className="ikb-row">
        <button type="button" className="ikb-btn-5" {...keyProps("shift")}><span className="ikb-ll ikb-xs">shift</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("z")}><span>Z</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("x")}><span>X</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("c")}><span>C</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("v")}><span>V</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("b")}><span>B</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("n")}><span>N</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("m")}><span>M</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps(",")}><span className="ikb-sm">&lt;<br/>,</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps(".")}><span className="ikb-sm">&gt;<br/>.</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("/")}><span className="ikb-sm">?<br/>/</span></button>
        <button type="button" className="ikb-btn-5" {...keyProps("shift")}><span className="ikb-lr ikb-xs">shift</span></button>
      </div>
      <div className="ikb-row">
        <button type="button" className="ikb-btn-2" {...keyProps("up")}><span><span className="ikb-up"></span></span></button>
      </div>
      <div className="ikb-row">
        <button type="button" className="ikb-btn-2" {...keyProps("numpad 1")}><span>1</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("numpad 2")}><span>2</span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("numpad 3")}><span>3</span></button>
        <button type="button" className="ikb-btn-10" {...keyProps("numpad enter")}><span className="ikb-lr ikb-xs">enter</span></button>
      </div>
      <div className="ikb-row">
        <button type="button" className="ikb-btn-7" {...keyProps("control")}><span className="ikb-ll ikb-xs">control</span></button>
        <button type="button" className="ikb-btn-6" {...keyProps("option")}><span className="ikb-ul ikb-xxs">alt</span><span className="ikb-ll ikb-xs">option</span></button>
        <button type="button" className="ikb-btn-7" {...keyProps("command")}>
          <span className="ikb-ll ikb-xs ikb-cmd">
            <span className="ikb-noxscale ikb-cmdicon">⌘</span>
            <span>command</span>
          </span>
        </button>
        <button type="button" className="ikb-btn-longest" {...keyProps("space")}><span></span></button>
        <button type="button" className="ikb-btn-7" {...keyProps("command")}>
          <span className="ikb-ll ikb-xs ikb-cmd">
            <span className="ikb-noxscale ikb-cmdicon">⌘</span>
            <span>command</span>
          </span>
        </button>
        <button type="button" className="ikb-btn-6" {...keyProps("option")}><span className="ikb-ur ikb-xxs">alt</span><span className="ikb-lr ikb-xs">option</span></button>
        <button type="button" className="ikb-btn-7" {...keyProps("control")}><span className="ikb-lr ikb-xs">control</span></button>
      </div>
      <div className="ikb-row">
        <button type="button" className="ikb-btn-2" {...keyProps("left")}><span><span className="ikb-left"></span></span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("down")}><span><span className="ikb-down"></span></span></button>
        <button type="button" className="ikb-btn-2" {...keyProps("right")}><span><span className="ikb-right"></span></span></button>
      </div>
      <div className="ikb-row">
        <button type="button" className="ikb-btn-9" {...keyProps("numpad 0")}><span>0</span></button>
        <button type="button" className="ikb-btn-8" {...keyProps("numpad .")}><span>.</span></button>
      </div>
    </div>
    </div>
  );
}

export default InteractiveKeyboard;

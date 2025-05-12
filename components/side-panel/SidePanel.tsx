'use client';

import "./react-select.scss";
import cn from "classnames";
import { useEffect, useRef, useState } from "react";
import Select, { SingleValue, ActionMeta } from 'react-select';
import { useLiveAPIContext } from "@/contexts/LiveAPIContext";
import { useLoggerStore } from "@/lib/store-logger";
import Logger, { LoggerFilterType } from "../logger/Logger";
import "./side-panel.scss";
import { useConsoleVisibility } from "@/contexts/ConsoleVisibilityContext";

// Define the option type explicitly
type FilterOptionType = { value: string; label: string };

const filterOptions: FilterOptionType[] = [
  { value: "conversations", label: "Conversations" },
  { value: "tools", label: "Tool Use" },
  { value: "none", label: "All" },
];

export default function SidePanel() {
  const { connected, client } = useLiveAPIContext();
  const { isConsoleVisible: open, toggleConsole: setOpen } = useConsoleVisibility();
  const loggerRef = useRef<HTMLDivElement>(null);
  const loggerLastHeightRef = useRef<number>(-1);
  const { log, logs } = useLoggerStore();

  const [textInput, setTextInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<FilterOptionType | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  //scroll the log to the bottom when new logs come in
  useEffect(() => {
    if (loggerRef.current) {
      const el = loggerRef.current;
      const scrollHeight = el.scrollHeight;
      if (scrollHeight !== loggerLastHeightRef.current) {
        el.scrollTop = scrollHeight;
        loggerLastHeightRef.current = scrollHeight;
      }
    }
  }, [logs]);

  // listen for log events and store them
  useEffect(() => {
    client.on("log", log);
    return () => {
      client.off("log", log);
    };
  }, [client, log]);

  const handleSubmit = () => {
    client.send([{ text: textInput }]);

    setTextInput("");
    if (inputRef.current) {
      inputRef.current.innerText = "";
    }
  };

  return (
    <div className={`side-panel ${open ? "open" : ""}`}>
      <header className="top">
        <h2>Console</h2>
        {open ? (
          <button className="opener" onClick={() => setOpen()}>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
        ) : (
          <button className="opener" onClick={() => setOpen()}>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        )}
      </header>
      <section className="indicators">
        <Select<FilterOptionType>
          instanceId="filter-select"
          className="react-select"
          classNamePrefix="react-select"
          styles={{
            control: (baseStyles) => ({
              ...baseStyles,
              background: "var(--Neutral-15)",
              color: "var(--Neutral-90)",
              minHeight: "33px",
              maxHeight: "33px",
              border: 0,
            }),
            option: (styles, { isFocused, isSelected }) => ({
              ...styles,
              backgroundColor: isFocused
                ? "var(--Neutral-30)"
                : isSelected
                  ? "var(--Neutral-20)"
                  : undefined,
            }),
          }}
          defaultValue={selectedOption}
          options={filterOptions}
          onChange={(newValue: SingleValue<FilterOptionType>, actionMeta: ActionMeta<FilterOptionType>) => {
            setSelectedOption(newValue);
          }}
        />
        <div className={cn("streaming-indicator", { connected })}>
          {connected
            ? `🔵${open ? " Streaming" : ""}`
            : `⏸️${open ? " Paused" : ""}`}
        </div>
      </section>
      <div className="side-panel-container" ref={loggerRef}>
        <Logger
          filter={(selectedOption?.value as LoggerFilterType) || "none"}
        />
      </div>
      <div className={cn("input-container", { disabled: !connected })}>
        <div className="input-content">
          <textarea
            className="input-area"
            ref={inputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit();
              }
            }}
            onChange={(e) => setTextInput(e.target.value)}
            value={textInput}
          ></textarea>
          <span
            className={cn("input-content-placeholder", {
              hidden: textInput.length,
            })}
          >
            Type&nbsp;something...
          </span>

          <button
            className="send-button"
            onClick={handleSubmit}
          >
            <span className="material-symbols-outlined filled">send</span>
          </button>
        </div>
      </div>
    </div>
  );
} 
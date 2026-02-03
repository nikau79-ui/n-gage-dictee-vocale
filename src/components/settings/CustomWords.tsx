import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../hooks/useSettings";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { SettingContainer } from "../ui/SettingContainer";
import { commands, CustomDictionary } from "../../bindings";

interface CustomWordsProps {
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
}

export const CustomWords: React.FC<CustomWordsProps> = React.memo(
  ({ descriptionMode = "tooltip", grouped = false }) => {
    const { t } = useTranslation();
    const { getSetting, updateSetting, isUpdating, refreshSettings } =
      useSettings();
    const [newWord, setNewWord] = useState("");
    const [importStatus, setImportStatus] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const customWords = (getSetting("custom_words") as string[]) || [];
    const customDictionaries =
      (getSetting("custom_dictionaries") as CustomDictionary[]) || [];

    const parseWordsFromFile = (
      content: string,
      filename: string
    ): { words: string[]; name: string } => {
      const isJson = filename.toLowerCase().endsWith(".json");
      const baseName = filename.replace(/\.(txt|json)$/i, "");

      if (isJson) {
        try {
          const data = JSON.parse(content);
          let words: string[] = [];
          let name = baseName;

          if (data.name) name = data.name;

          if (Array.isArray(data)) {
            words = data.filter((w: unknown) => typeof w === "string") as string[];
          } else if (data.words && Array.isArray(data.words)) {
            words = data.words.filter((w: unknown) => typeof w === "string") as string[];
          } else {
            Object.entries(data).forEach(([key, value]) => {
              if (key.startsWith("_")) return;
              if (Array.isArray(value)) {
                value.forEach((w: unknown) => {
                  if (typeof w === "string") words.push(w);
                });
              }
            });
          }
          return { words, name };
        } catch {
          return { words: [], name: baseName };
        }
      } else {
        const words = content
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith("#"));
        return { words, name: baseName };
      }
    };

    const handleFileImport = async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const content = await file.text();
        const { words, name } = parseWordsFromFile(content, file.name);

        // Filter: no spaces, max 50 chars
        const validWords = words.filter(
          (word) => word && !word.includes(" ") && word.length <= 50
        );

        if (validWords.length > 0) {
          const id = `dict_${Date.now()}`;
          const result = await commands.addDictionary(id, name, validWords);

          if (result.status === "ok") {
            await refreshSettings();
            setImportStatus(
              t("settings.advanced.customWords.importSuccess", {
                count: validWords.length,
                name,
              })
            );
          } else {
            setImportStatus(t("settings.advanced.customWords.importError"));
          }
        } else {
          setImportStatus(t("settings.advanced.customWords.importEmpty"));
        }

        setTimeout(() => setImportStatus(null), 3000);
      } catch (error) {
        console.error("Failed to import file:", error);
        setImportStatus(t("settings.advanced.customWords.importError"));
        setTimeout(() => setImportStatus(null), 3000);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const handleToggleDictionary = async (id: string, enabled: boolean) => {
      const result = await commands.toggleDictionary(id, enabled);
      if (result.status === "ok") {
        await refreshSettings();
      }
    };

    const handleRemoveDictionary = async (id: string) => {
      const result = await commands.removeDictionary(id);
      if (result.status === "ok") {
        await refreshSettings();
      }
    };

    const handleAddWord = () => {
      const trimmedWord = newWord.trim();
      const sanitizedWord = trimmedWord.replace(/[<>"'&]/g, "");
      if (
        sanitizedWord &&
        !sanitizedWord.includes(" ") &&
        sanitizedWord.length <= 50 &&
        !customWords.includes(sanitizedWord)
      ) {
        updateSetting("custom_words", [...customWords, sanitizedWord]);
        setNewWord("");
      }
    };

    const handleRemoveWord = (wordToRemove: string) => {
      updateSetting(
        "custom_words",
        customWords.filter((word) => word !== wordToRemove)
      );
    };

    const handleClearWords = () => {
      updateSetting("custom_words", []);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddWord();
      }
    };

    return (
      <>
        <SettingContainer
          title={t("settings.advanced.customWords.title")}
          description={t("settings.advanced.customWords.description")}
          descriptionMode={descriptionMode}
          grouped={grouped}
        >
          <div className="flex flex-col gap-3">
            {/* Import button */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.json"
                onChange={handleFileImport}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUpdating("custom_dictionaries")}
                variant="primary"
                size="md"
              >
                {t("settings.advanced.customWords.importDictionary")}
              </Button>
              {importStatus && (
                <span className="text-sm text-accent">{importStatus}</span>
              )}
            </div>

            {/* Dictionaries list */}
            {customDictionaries.length > 0 && (
              <div className="flex flex-col gap-2">
                {customDictionaries.map((dict) => (
                  <div
                    key={dict.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-mid-gray/20 bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dict.enabled}
                          onChange={(e) =>
                            handleToggleDictionary(dict.id, e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-mid-gray/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
                      </label>
                      <div>
                        <span className="font-medium">{dict.name}</span>
                        <span className="text-sm text-mid-gray ml-2">
                          ({dict.words.length}{" "}
                          {t("settings.advanced.customWords.words")})
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRemoveDictionary(dict.id)}
                      variant="secondary"
                      size="sm"
                      aria-label={t(
                        "settings.advanced.customWords.removeDictionary"
                      )}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Individual words section */}
            <div className="border-t border-mid-gray/20 pt-3 mt-1">
              <div className="text-sm text-mid-gray mb-2">
                {t("settings.advanced.customWords.individualWords")}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  className="max-w-40"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={t("settings.advanced.customWords.placeholder")}
                  variant="compact"
                  disabled={isUpdating("custom_words")}
                />
                <Button
                  onClick={handleAddWord}
                  disabled={
                    !newWord.trim() ||
                    newWord.includes(" ") ||
                    newWord.trim().length > 50 ||
                    isUpdating("custom_words")
                  }
                  variant="secondary"
                  size="md"
                >
                  {t("settings.advanced.customWords.add")}
                </Button>
              </div>
            </div>
          </div>
        </SettingContainer>

        {/* Individual words display */}
        {customWords.length > 0 && (
          <div
            className={`px-4 p-2 ${grouped ? "" : "rounded-lg border border-mid-gray/20"}`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-mid-gray">
                {customWords.length}{" "}
                {t("settings.advanced.customWords.words")}
              </span>
              <Button
                onClick={handleClearWords}
                disabled={isUpdating("custom_words")}
                variant="secondary"
                size="sm"
              >
                {t("settings.advanced.customWords.clearAll")}
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {customWords.map((word) => (
                <Button
                  key={word}
                  onClick={() => handleRemoveWord(word)}
                  disabled={isUpdating("custom_words")}
                  variant="secondary"
                  size="sm"
                  className="inline-flex items-center gap-1 cursor-pointer"
                  aria-label={t("settings.advanced.customWords.remove", {
                    word,
                  })}
                >
                  <span>{word}</span>
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }
);

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const COLLEGEBASE_APP_URL = "https://app.collegebase.org/";
const RAW_OUTPUT_PATH = path.join(
  process.cwd(),
  "tmp/collegebase/collegebase-applications.raw.json",
);
const NORMALIZED_OUTPUT_PATH = path.join(
  process.cwd(),
  "tmp/collegebase/collegebase-applications.normalized.json",
);
const ATLAS_CLI_PATH = path.join(
  process.env.CODEX_HOME ?? path.join(os.homedir(), ".codex"),
  "skills/atlas/scripts/atlas_cli.py",
);
const DOWNLOAD_PREFIX = "collegebase-applications-raw-";
const DOWNLOAD_TIMEOUT_MS = 120_000;
const POLL_INTERVAL_MS = 1_000;

function normalizeWhitespace(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function readText(node) {
  if (!node) {
    return "";
  }

  const raw =
    typeof node.innerText === "string" && node.innerText.trim()
      ? node.innerText
      : node.textContent ?? "";
  return normalizeWhitespace(raw);
}

function dedupeStrings(values) {
  const seen = new Set();
  const deduped = [];
  for (const value of values) {
    const normalized = normalizeWhitespace(value);
    if (!normalized) {
      continue;
    }
    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(normalized);
  }
  return deduped;
}

function textLinesFromElement(element) {
  const seen = new Set();
  const lines = [];
  const raw = (element?.innerText || element?.textContent || "").split(/\n+/);
  for (const part of raw) {
    const line = normalizeWhitespace(part);
    if (!line) {
      continue;
    }
    if (seen.has(line)) {
      continue;
    }
    seen.add(line);
    lines.push(line);
  }
  return lines;
}

export function extractLabelValuePairsFromText(value) {
  const text = normalizeWhitespace(value);
  if (!text.includes(":")) {
    return {};
  }

  const pairs = {};
  const regex = /([A-Za-z][A-Za-z/&()' -]+):\s*([^:]+?)(?=(?:\s+[A-Za-z][A-Za-z/&()' -]+:)|$)/g;
  let match = regex.exec(text);
  while (match) {
    const key = normalizeWhitespace(match[1]);
    const pairValue = normalizeWhitespace(match[2]);
    if (key && pairValue) {
      pairs[key] = pairValue;
    }
    match = regex.exec(text);
  }
  return pairs;
}

function findSectionHeadingNodes(detailRoot) {
  const candidates = [];
  const selector =
    "h1, h2, h3, h4, h5, h6, [role='heading'], strong, summary, p, span, div";
  for (const node of detailRoot.querySelectorAll(selector)) {
    const text = readText(node);
    if (!text || text.length > 40 || text.includes(":")) {
      continue;
    }
    if (!/[A-Za-z]/.test(text)) {
      continue;
    }
    candidates.push(node);
  }
  return candidates;
}

function findSectionContainerForHeading(headingNode, detailRoot) {
  let current = headingNode;
  let chosen = null;
  while (current && current !== detailRoot) {
    const text = readText(current);
    if (text.length >= 12 && text.length > readText(headingNode).length) {
      chosen = current;
    }
    current = current.parentElement;
  }
  return chosen ?? headingNode.parentElement ?? detailRoot;
}

export function extractOverviewBadges(overviewSection) {
  const badges = [];
  for (const node of overviewSection.querySelectorAll("span, button, p, div")) {
    if (node.children.length > 0) {
      continue;
    }
    const text = readText(node);
    if (!text || text === "OVERVIEW" || text.includes(":")) {
      continue;
    }
    if (text.length > 24) {
      continue;
    }
    if (!/[A-Za-z0-9]/.test(text)) {
      continue;
    }
    badges.push(text);
  }
  return dedupeStrings(badges);
}

export function extractOverviewFields(overviewSection) {
  const overviewFields = {};

  const labelNodes = [
    ...overviewSection.querySelectorAll("strong, b, label"),
  ].filter((node) => /:\s*$/.test(readText(node)));

  for (const labelNode of labelNodes) {
    const key = normalizeWhitespace(readText(labelNode).replace(/:\s*$/, ""));
    if (!key) {
      continue;
    }

    const valueParts = [];
    let current = labelNode.nextSibling;
    while (current) {
      if (
        current.nodeType === 1 &&
        /^(STRONG|B|LABEL)$/.test(current.nodeName)
      ) {
        break;
      }
      valueParts.push(current.textContent ?? "");
      current = current.nextSibling;
    }

    const value = normalizeWhitespace(valueParts.join(" "));
    if (value) {
      overviewFields[key] = value;
    }
  }

  if (Object.keys(overviewFields).length > 0) {
    return overviewFields;
  }

  for (const line of textLinesFromElement(overviewSection)) {
    if (line === "OVERVIEW") {
      continue;
    }
    Object.assign(overviewFields, extractLabelValuePairsFromText(line));
  }
  return overviewFields;
}

export function extractSectionValueFromElement(sectionElement, sectionTitle = "") {
  const clone = sectionElement.cloneNode(true);
  for (const node of clone.querySelectorAll("h1, h2, h3, h4, h5, h6, [role='heading'], strong")) {
    const text = readText(node);
    if (text === sectionTitle || text === "OVERVIEW") {
      node.remove();
    }
  }

  const listItems = dedupeStrings(
    [...clone.querySelectorAll("li")]
      .map((item) => readText(item))
      .map((item) => item.replace(/^\d+[.)]\s*/, "")),
  );
  if (listItems.length > 0) {
    return { kind: "list", value: listItems };
  }

  const lines = textLinesFromElement(clone);
  const kvEntries = {};
  for (const line of lines) {
    const extracted = extractLabelValuePairsFromText(line);
    Object.assign(kvEntries, extracted);
  }
  if (Object.keys(kvEntries).length > 0) {
    return { kind: "kv", value: kvEntries };
  }

  const numberedLines = lines
    .filter((line) => /^\d+[.)]\s*/.test(line))
    .map((line) => line.replace(/^\d+[.)]\s*/, ""));
  if (numberedLines.length > 0) {
    return { kind: "list", value: numberedLines };
  }

  return {
    kind: "text",
    value: normalizeWhitespace(readText(clone)),
  };
}

export function extractRawRecordFromDetailRoot(detailRoot, context = {}) {
  const overviewHeading = findSectionHeadingNodes(detailRoot).find(
    (node) => readText(node).toUpperCase() === "OVERVIEW",
  );
  const overviewSection = overviewHeading
    ? findSectionContainerForHeading(overviewHeading, detailRoot)
    : detailRoot;
  const headings = findSectionHeadingNodes(detailRoot);
  const sectionEntries = [];
  const usedContainers = new Set();

  for (const headingNode of headings) {
    const title = readText(headingNode);
    if (!title) {
      continue;
    }

    if (
      title.toUpperCase() !== "OVERVIEW" &&
      overviewSection &&
      overviewSection.contains(headingNode)
    ) {
      continue;
    }

    const container = findSectionContainerForHeading(headingNode, detailRoot);
    if (!container || usedContainers.has(container)) {
      continue;
    }

    const bodyText = readText(container);
    if (bodyText.length <= title.length) {
      continue;
    }

    usedContainers.add(container);
    sectionEntries.push({
      title,
      container,
    });
  }

  const overviewFields = extractOverviewFields(overviewSection);
  const overviewBadges = extractOverviewBadges(overviewSection);

  const sectionMap = {};
  for (const entry of sectionEntries) {
    if (entry.title.toUpperCase() === "OVERVIEW") {
      continue;
    }
    sectionMap[entry.title] = extractSectionValueFromElement(
      entry.container,
      entry.title,
    );
  }

  return {
    sourceCardIndex: context.sourceCardIndex ?? 0,
    applicationYearLabel: context.applicationYearLabel,
    overviewBadges,
    overviewFields,
    sectionMap,
    capturedTitle: context.capturedTitle ?? "",
    capturedUrl: context.capturedUrl ?? "",
  };
}

function sectionNameMatches(name, expected) {
  return normalizeWhitespace(name).toLowerCase() === expected;
}

function normalizeDelimitedList(value) {
  return dedupeStrings(
    normalizeWhitespace(value)
      .split(/\s*,\s*|\s*;\s*/)
      .map((item) => item.trim()),
  );
}

function parseInteger(value) {
  if (!value) {
    return undefined;
  }
  const match = String(value).match(/-?\d+/);
  return match ? Number.parseInt(match[0], 10) : undefined;
}

function parseFloatNumber(value) {
  if (!value) {
    return undefined;
  }
  const match = String(value).match(/-?\d+(?:\.\d+)?/);
  return match ? Number.parseFloat(match[0]) : undefined;
}

function parseRank(value) {
  const match = String(value ?? "").match(/(\d+)\s*\/\s*(\d+)/);
  return match
    ? {
        classRankDisplay: normalizeWhitespace(value),
        classRankNumerator: Number.parseInt(match[1], 10),
        classRankDenominator: Number.parseInt(match[2], 10),
      }
    : {
        classRankDisplay: normalizeWhitespace(value),
      };
}

function getSectionByName(sectionMap, expectedName) {
  return Object.entries(sectionMap).find(([name]) =>
    sectionNameMatches(name, expectedName.toLowerCase()),
  )?.[1];
}

export function buildSourceId(record) {
  const payload = JSON.stringify({
    applicationYearLabel: record.applicationYearLabel ?? null,
    overview: record.overview,
    academics: record.academics,
    extracurricularItems: record.extracurricularItems,
    awardItems: record.awardItems,
    acceptanceSchoolNames: record.acceptanceSchoolNames,
    otherSections: record.otherSections,
  });
  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

export function normalizeRawRecord(rawRecord) {
  const overviewFields = rawRecord.overviewFields ?? {};
  const academicsSection = getSectionByName(rawRecord.sectionMap ?? {}, "academics");
  const extracurricularSection = getSectionByName(
    rawRecord.sectionMap ?? {},
    "extracurriculars",
  );
  const awardsSection = getSectionByName(rawRecord.sectionMap ?? {}, "awards");
  const acceptancesSection = getSectionByName(
    rawRecord.sectionMap ?? {},
    "acceptances",
  );

  const academicsRawItems =
    academicsSection?.kind === "kv" && academicsSection.value
      ? academicsSection.value
      : {};
  const rank = parseRank(academicsRawItems.Rank);

  const record = {
    sourceId: "",
    listName: "all",
    sourceCardIndex: rawRecord.sourceCardIndex,
    applicationYearLabel: rawRecord.applicationYearLabel,
    overview: {
      badges: rawRecord.overviewBadges ?? [],
      intendedMajors: normalizeDelimitedList(
        overviewFields.Major ?? overviewFields.Majors ?? "",
      ),
      raceLabel: overviewFields.Race,
      genderLabel: overviewFields.Gender,
    },
    academics: {
      satComposite: parseInteger(academicsRawItems.SAT),
      actComposite: parseInteger(academicsRawItems.ACT),
      unweightedGpa: parseFloatNumber(academicsRawItems["Unweighted GPA"]),
      weightedGpa: parseFloatNumber(academicsRawItems["Weighted GPA"]),
      classRankDisplay: rank.classRankDisplay,
      classRankNumerator: rank.classRankNumerator,
      classRankDenominator: rank.classRankDenominator,
      apCourseCount: parseInteger(academicsRawItems["AP Courses"]),
      ibCourseCount: parseInteger(academicsRawItems["IB Courses"]),
      rawItems: academicsRawItems,
    },
    extracurricularItems:
      extracurricularSection?.kind === "list"
        ? extracurricularSection.value.map((description, index) => ({
            sortOrder: index + 1,
            description,
          }))
        : [],
    awardItems:
      awardsSection?.kind === "list"
        ? awardsSection.value.map((description, index) => ({
            sortOrder: index + 1,
            description,
          }))
        : [],
    acceptanceSchoolNames:
      acceptancesSection?.kind === "list"
        ? [...acceptancesSection.value]
        : acceptancesSection?.kind === "text"
          ? normalizeDelimitedList(acceptancesSection.value)
          : [],
    otherSections: Object.fromEntries(
      Object.entries(rawRecord.sectionMap ?? {}).filter(([name]) => {
        const key = normalizeWhitespace(name).toLowerCase();
        return !["academics", "extracurriculars", "awards", "acceptances"].includes(
          key,
        );
      }),
    ),
    sourceSnapshot: {
      url: rawRecord.capturedUrl ?? "",
      title: rawRecord.capturedTitle ?? "",
    },
  };

  record.sourceId = buildSourceId(record);
  return record;
}

export function normalizeRawExport(rawExport) {
  return {
    records: (rawExport.records ?? []).map((record) => normalizeRawRecord(record)),
  };
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    ...options,
  });

  if (result.status !== 0) {
    const stderr = normalizeWhitespace(result.stderr || result.stdout || "");
    throw new Error(stderr || `Command failed: ${command} ${args.join(" ")}`);
  }

  return result.stdout ?? "";
}

function requireAtlasCli() {
  if (!existsSync(ATLAS_CLI_PATH)) {
    throw new Error(`Atlas CLI not found at ${ATLAS_CLI_PATH}.`);
  }
}

function listAtlasTabs() {
  const output = runCommand("python3.12", [ATLAS_CLI_PATH, "tabs", "--json"]);
  return JSON.parse(output);
}

function focusAtlasTab(windowId, tabIndex) {
  runCommand("python3.12", [
    ATLAS_CLI_PATH,
    "focus-tab",
    String(windowId),
    String(tabIndex),
  ]);
}

function getActiveTabState() {
  const script = [
    'tell application "ChatGPT Atlas"',
    "set i to active tab index of front window",
    'return (URL of tab i of front window) & linefeed & (title of tab i of front window)',
    "end tell",
  ].join("\n");
  const output = runCommand("osascript", ["-"], { input: script });
  const [url = "", title = ""] = output.split(/\r?\n/);
  return {
    url: normalizeWhitespace(url),
    title: normalizeWhitespace(title),
  };
}

function escapeAppleScriptString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function clickJavaScriptIntoAtlas(payload) {
  const previousClipboard = runCommand("pbpaste", []);
  runCommand("pbcopy", [], { input: payload });

  const script = [
    'tell application "ChatGPT Atlas" to activate',
    "delay 0.25",
    'tell application "System Events"',
    'keystroke "l" using command down',
    "delay 0.15",
    'keystroke "v" using command down',
    "delay 0.15",
    "key code 36",
    "end tell",
  ].join("\n");

  try {
    runCommand("osascript", ["-"], { input: script });
  } catch (error) {
    const message = normalizeWhitespace(error.message);
    if (
      message.includes("Not authorised") ||
      message.includes("not allowed assistive access")
    ) {
      throw new Error(
        "macOS blocked Atlas automation. Grant Terminal Automation access for ChatGPT Atlas and Accessibility access for System Events, then rerun.",
      );
    }
    throw error;
  } finally {
    runCommand("pbcopy", [], { input: previousClipboard });
  }
}

function latestMatchingDownload(startedAtMs) {
  const downloadsDir = path.join(os.homedir(), "Downloads");
  if (!existsSync(downloadsDir)) {
    return null;
  }

  const candidates = readdirSync(downloadsDir)
    .filter(
      (name) => name.startsWith(DOWNLOAD_PREFIX) && name.endsWith(".json"),
    )
    .map((name) => {
      const absolutePath = path.join(downloadsDir, name);
      const stats = statSync(absolutePath);
      return {
        absolutePath,
        modifiedMs: stats.mtimeMs,
      };
    })
    .filter((entry) => entry.modifiedMs >= startedAtMs)
    .sort((left, right) => right.modifiedMs - left.modifiedMs);

  return candidates[0]?.absolutePath ?? null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDownloadOrError(startedAtMs) {
  const deadline = Date.now() + DOWNLOAD_TIMEOUT_MS;

  while (Date.now() <= deadline) {
    const downloadPath = latestMatchingDownload(startedAtMs);
    if (downloadPath) {
      return downloadPath;
    }

    const tabState = getActiveTabState();
    if (tabState.title.startsWith("__COLLEGEBASE_EXPORT_ERROR__ ")) {
      const message = tabState.title.replace("__COLLEGEBASE_EXPORT_ERROR__ ", "");
      throw new Error(message);
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(
    "Timed out waiting for the CollegeBase export download. Confirm the Applications > All view is open in Atlas and rerun.",
  );
}

function ensureOutputDirectory() {
  mkdirSync(path.dirname(RAW_OUTPUT_PATH), { recursive: true });
}

function moveFile(sourcePath, destinationPath) {
  if (existsSync(destinationPath)) {
    rmSync(destinationPath);
  }
  renameSync(sourcePath, destinationPath);
}

function buildDownloadFileName() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${DOWNLOAD_PREFIX}${timestamp}.json`;
}

function buildBrowserExtractionSource(downloadFileName) {
  const source = `
    (async () => {
      ${normalizeWhitespace.toString()}
      ${readText.toString()}
      ${dedupeStrings.toString()}
      ${textLinesFromElement.toString()}
      ${extractLabelValuePairsFromText.toString()}
      ${findSectionHeadingNodes.toString()}
      ${findSectionContainerForHeading.toString()}
      ${extractOverviewBadges.toString()}
      ${extractOverviewFields.toString()}
      ${extractSectionValueFromElement.toString()}
      ${extractRawRecordFromDetailRoot.toString()}

      const DOWNLOAD_FILE_NAME = ${JSON.stringify(downloadFileName)};
      const originalTitle = document.title;

      function isVisible(element) {
        if (!element) {
          return false;
        }
        const style = window.getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden") {
          return false;
        }
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }

      function wait(ms) {
        return new Promise((resolve) => window.setTimeout(resolve, ms));
      }

      function findClickableByText(label) {
        const normalized = normalizeWhitespace(label).toLowerCase();
        return [...document.querySelectorAll("button, [role='button'], a, div, span")]
          .filter((node) => isVisible(node))
          .find((node) => normalizeWhitespace(node.textContent || "").toLowerCase() === normalized);
      }

      function clickApplicationsAllTab() {
        const allTab = findClickableByText("All");
        if (!allTab) {
          throw new Error("Unable to find the Applications filter tabs. Open the Applications view before running the extractor.");
        }
        allTab.click();
      }

      function findApplicationsColumn() {
        const candidates = [...document.querySelectorAll("*")]
          .filter((node) => node instanceof HTMLElement)
          .filter((node) => isVisible(node))
          .filter((node) => {
            const style = window.getComputedStyle(node);
            const scrollable =
              /(auto|scroll)/.test(style.overflowY) ||
              node.scrollHeight > node.clientHeight + 100;
            if (!scrollable) {
              return false;
            }
            const rect = node.getBoundingClientRect();
            if (rect.width < 160 || rect.width > 420 || rect.height < 300) {
              return false;
            }
            return (readText(node).match(/\\b20\\d{2}\\b/g) || []).length >= 2;
          })
          .sort((left, right) => {
            const leftHits = (readText(left).match(/\\b20\\d{2}\\b/g) || []).length;
            const rightHits = (readText(right).match(/\\b20\\d{2}\\b/g) || []).length;
            return rightHits - leftHits;
          });
        return candidates[0] ?? null;
      }

      function collectVisibleCards(column) {
        const cards = [...column.querySelectorAll("*")]
          .filter((node) => node instanceof HTMLElement)
          .filter((node) => isVisible(node))
          .filter((node) => {
            const rect = node.getBoundingClientRect();
            if (rect.width < 160 || rect.height < 120) {
              return false;
            }
            return /\\b20\\d{2}\\b/.test(readText(node));
          })
          .sort((left, right) => left.getBoundingClientRect().top - right.getBoundingClientRect().top);

        return cards.filter((candidate) => {
          return !cards.some(
            (other) => other !== candidate && other.contains(candidate),
          );
        });
      }

      function findOverviewHeading() {
        return [...document.querySelectorAll("h1, h2, h3, h4, h5, h6, div, span, p")]
          .find((node) => normalizeWhitespace(node.textContent || "") === "OVERVIEW");
      }

      function findDetailRoot(column) {
        const overviewHeading = findOverviewHeading();
        if (!overviewHeading) {
          return null;
        }

        const columnRect = column.getBoundingClientRect();
        let current = overviewHeading;
        let best = null;
        while (current && current !== document.body) {
          const rect = current.getBoundingClientRect();
          if (rect.left > columnRect.right - 20 && rect.width > 400 && rect.height > 120) {
            best = current;
          }
          current = current.parentElement;
        }
        return best ?? overviewHeading.parentElement;
      }

      function detailMarker(detailRoot) {
        return readText(detailRoot).slice(0, 500);
      }

      async function waitForDetailStability(previousMarker) {
        const startedAt = Date.now();
        let stableCount = 0;
        let lastMarker = "";

        while (Date.now() - startedAt < 8_000) {
          const column = findApplicationsColumn();
          const detailRoot = column ? findDetailRoot(column) : null;
          const marker = detailRoot ? detailMarker(detailRoot) : "";
          if (marker && marker !== previousMarker) {
            if (marker === lastMarker) {
              stableCount += 1;
            } else {
              stableCount = 1;
              lastMarker = marker;
            }
            if (stableCount >= 2) {
              return detailRoot;
            }
          }
          await wait(250);
        }

        const column = findApplicationsColumn();
        const detailRoot = column ? findDetailRoot(column) : null;
        if (!detailRoot) {
          throw new Error("Unable to locate the selected application detail pane.");
        }
        return detailRoot;
      }

      function extractYearLabelFromCard(card) {
        const match = readText(card).match(/\\b20\\d{2}\\b/);
        return match ? match[0] : undefined;
      }

      function cardSignature(card) {
        return normalizeWhitespace(readText(card)).toLowerCase();
      }

      function downloadJson(payload) {
        const json = JSON.stringify(payload, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = DOWNLOAD_FILE_NAME;
        anchor.style.display = "none";
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => window.URL.revokeObjectURL(url), 1_000);
      }

      document.title = "__COLLEGEBASE_EXPORT_RUNNING__ " + originalTitle;

      try {
        clickApplicationsAllTab();
        await wait(600);

        const applicationsColumn = findApplicationsColumn();
        if (!applicationsColumn) {
          throw new Error("Unable to find the Applications card list. Open Applications > All and rerun.");
        }

        applicationsColumn.scrollTop = 0;
        await wait(400);

        const records = [];
        const seenSignatures = new Set();
        let stagnantPasses = 0;

        while (stagnantPasses < 3) {
          const visibleCards = collectVisibleCards(applicationsColumn);
          let newCardsThisPass = 0;

          for (const card of visibleCards) {
            const signature = cardSignature(card);
            if (!signature || seenSignatures.has(signature)) {
              continue;
            }

            seenSignatures.add(signature);
            newCardsThisPass += 1;
            const previousMarker = detailMarker(findDetailRoot(applicationsColumn));
            card.scrollIntoView({ block: "center" });
            await wait(200);
            card.click();
            await wait(250);

            const detailRoot = await waitForDetailStability(previousMarker);
            records.push(
              extractRawRecordFromDetailRoot(detailRoot, {
                sourceCardIndex: records.length + 1,
                applicationYearLabel: extractYearLabelFromCard(card),
                capturedTitle: document.title.replace(/^__COLLEGEBASE_EXPORT_RUNNING__\\s*/, ""),
                capturedUrl: window.location.href,
              }),
            );
          }

          const before = applicationsColumn.scrollTop;
          applicationsColumn.scrollBy({ top: applicationsColumn.clientHeight * 0.85 });
          await wait(400);
          const after = applicationsColumn.scrollTop;

          if (newCardsThisPass === 0 || Math.abs(after - before) < 4) {
            stagnantPasses += 1;
          } else {
            stagnantPasses = 0;
          }
        }

        if (records.length === 0) {
          throw new Error("No application cards were extracted. Confirm that Applications > All contains records.");
        }

        downloadJson({
          source: "collegebase",
          listName: "all",
          extractedAt: new Date().toISOString(),
          extractionMode: "atlas_javascript_injection",
          sourceUrl: window.location.href,
          recordCount: records.length,
          records,
        });

        document.title = originalTitle;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown CollegeBase extraction error";
        document.title = "__COLLEGEBASE_EXPORT_ERROR__ " + message;
        throw error;
      }
    })();
  `;

  const base64 = Buffer.from(source, "utf8").toString("base64");
  return `javascript:eval(atob(${JSON.stringify(base64)}))`;
}

export async function extractCollegebaseApplications() {
  requireAtlasCli();
  ensureOutputDirectory();
  runCommand("python3.12", [ATLAS_CLI_PATH, "app-name"]);

  const tab = listAtlasTabs().find((candidate) =>
    String(candidate.url ?? "").startsWith(COLLEGEBASE_APP_URL),
  );
  if (!tab) {
    throw new Error(
      "No CollegeBase tab is open in ChatGPT Atlas. Open the logged-in Applications view and rerun.",
    );
  }

  focusAtlasTab(tab.window_id, tab.tab_index);
  const activeTab = getActiveTabState();
  if (!activeTab.url.startsWith(COLLEGEBASE_APP_URL)) {
    throw new Error("Atlas did not focus the CollegeBase tab correctly.");
  }

  const downloadFileName = buildDownloadFileName();
  const startedAtMs = Date.now();
  const payload = buildBrowserExtractionSource(downloadFileName);
  clickJavaScriptIntoAtlas(payload);

  const downloadedPath = await waitForDownloadOrError(startedAtMs);
  moveFile(downloadedPath, RAW_OUTPUT_PATH);

  const rawExport = JSON.parse(readFileSync(RAW_OUTPUT_PATH, "utf8"));
  const normalizedExport = normalizeRawExport(rawExport);
  writeFileSync(NORMALIZED_OUTPUT_PATH, JSON.stringify(normalizedExport, null, 2));

  return {
    rawPath: RAW_OUTPUT_PATH,
    normalizedPath: NORMALIZED_OUTPUT_PATH,
    recordCount: rawExport.recordCount ?? rawExport.records?.length ?? 0,
  };
}

async function main() {
  const result = await extractCollegebaseApplications();
  console.log(
    JSON.stringify(
      {
        rawPath: result.rawPath,
        normalizedPath: result.normalizedPath,
        recordCount: result.recordCount,
      },
      null,
      2,
    ),
  );
}

const isEntrypoint =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntrypoint) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}

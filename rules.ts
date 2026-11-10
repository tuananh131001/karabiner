import fs from "fs";
import {
  Device,
  KarabinerRules,
  Parameters,
  VirtualHidKeyboard,
} from "./types";
import { createHyperSubLayers, app, open, window, shell } from "./utils";

const rules: KarabinerRules[] = [
  // Escape hatch: Hyper swallows caps_lock, so keep a way to toggle the real
  // Caps Lock state. Must come before the Hyper rule (first match wins).
  {
    description: "Shift + Caps Lock -> Caps Lock",
    manipulators: [
      {
        type: "basic",
        from: { key_code: "caps_lock", modifiers: { mandatory: ["shift"] } },
        to: [{ key_code: "caps_lock" }],
      },
    ],
  },
  // Escape lives on Caps Lock (tap), so the physical Esc key toggles Caps Lock.
  {
    description: "Esc -> Caps Lock",
    manipulators: [
      {
        type: "basic",
        from: { key_code: "escape", modifiers: { optional: ["any"] } },
        to: [{ key_code: "caps_lock" }],
      },
    ],
  },
  // Define the Hyper key itself
  {
    description: "Hyper Key (⌃⌥⇧⌘)",
    manipulators: [
      {
        description: "Caps Lock -> Hyper Key",
        from: {
          key_code: "caps_lock",
          modifiers: {
            optional: ["any"],
          },
        },
        to: [
          {
            set_variable: {
              name: "hyper",
              value: 1,
            },
          },
        ],
        to_after_key_up: [
          {
            set_variable: {
              name: "hyper",
              value: 0,
            },
          },
        ],
        to_if_alone: [
          {
            key_code: "escape",
          },
        ],
        type: "basic",
      },
    ],
  },
  ...createHyperSubLayers({
    o: {
      b: app("Brave Browser"),
      s: app("Slack"),
      n: app("Notion"),
      g: app("Ghostty"),
      f: app("Finder"),
      e: app("Microsoft Edge"),
    },
    // Navigation layer
    h: { to: [{ key_code: "left_arrow" }], description: "←" },
    j: { to: [{ key_code: "down_arrow" }], description: "↓" },
    k: { to: [{ key_code: "up_arrow" }], description: "↑" },
    l: { to: [{ key_code: "right_arrow" }], description: "→" },
    b: {
      to: [{ key_code: "left_arrow", modifiers: ["left_option"] }],
      description: "Prev word",
    },
    w: {
      to: [{ key_code: "right_arrow", modifiers: ["left_option"] }],
      description: "Next word",
    },
    "0": {
      to: [{ key_code: "left_arrow", modifiers: ["left_command"] }],
      description: "Line start",
    },
    "4": {
      to: [{ key_code: "right_arrow", modifiers: ["left_command"] }],
      description: "Line end",
    },
    u: { to: [{ key_code: "page_up" }], description: "Page up" },
    d: { to: [{ key_code: "page_down" }], description: "Page down" },
    x: { to: [{ key_code: "delete_forward" }], description: "Forward delete" },
    delete_or_backspace: {
      to: [{ key_code: "delete_or_backspace", modifiers: ["left_command"] }],
      description: "Delete to line start",
    },
  }),
];

const parameters: Parameters = {
  "basic.to_if_alone_timeout_milliseconds": 300,
  "basic.to_if_held_down_threshold_milliseconds": 125,
  "basic.to_delayed_action_delay_milliseconds": 200,
  "basic.simultaneous_threshold_milliseconds": 100,
};

const virtual_hid_keyboard: VirtualHidKeyboard = {
  keyboard_type_v2: "ansi",
};

const devices: Device[] = [
  {
    identifiers: { is_keyboard: true, vendor_id: 13364, product_id: 53296 },
    ignore_vendor_events: true,
  },
  {
    identifiers: { is_keyboard: true, vendor_id: 14000, product_id: 12302 },
    disable_built_in_keyboard_if_exists: true,
    ignore_vendor_events: true,
  },
  {
    identifiers: {
      is_keyboard: true,
      is_pointing_device: true,
      vendor_id: 14000,
      product_id: 12292,
    },
    ignore: true,
    ignore_vendor_events: true,
  },
];

fs.writeFileSync(
  "karabiner.json",
  JSON.stringify(
    {
      global: {
        show_in_menu_bar: false,
      },
      profiles: [
        {
          name: "Default",
          devices,
          virtual_hid_keyboard,
          complex_modifications: {
            parameters,
            rules,
          },
        },
      ],
    },
    null,
    2
  )
);

import fs from "fs";
import {
  Device,
  KarabinerRules,
  Manipulator,
  Parameters,
  To,
  VirtualHidKeyboard,
} from "./types";
import { createHyperSubLayers, app, open, window, shell } from "./utils";

// GACS home row mods: pinky = ⌘, ring = ⌥, middle = ⌃, index = ⇧
const HOME_ROW_MODS = [
  { a: "left_command", s: "left_option", d: "left_control", f: "left_shift" },
  {
    semicolon: "left_command",
    l: "left_option",
    k: "left_control",
    j: "left_shift",
  },
] as const;

function homeRowMods(): KarabinerRules {
  const manipulators: Manipulator[] = [];

  for (const hand of HOME_ROW_MODS) {
    const keys = Object.keys(hand) as (keyof typeof hand)[];
    const mod = (key: string) => hand[key as keyof typeof hand];

    const held = (combo: string[]): To[] => {
      const [first, ...rest] = combo.map(mod);
      return [rest.length ? { key_code: first, modifiers: rest } : { key_code: first }];
    };

    // All four fingers, then every triple, then every pair, then singles.
    // Karabiner matches top-down, so the widest combos have to come first.
    manipulators.push({
      from: { simultaneous: keys.map((key_code) => ({ key_code })) },
      to_if_held_down: held(keys),
      type: "basic",
    });

    for (const dropped of keys) {
      const combo = keys.filter((key) => key !== dropped);
      manipulators.push({
        from: { simultaneous: combo.map((key_code) => ({ key_code })) },
        to_if_held_down: held(combo),
        type: "basic",
      });
    }

    for (const first of keys) {
      for (const second of keys) {
        if (first === second) continue;
        manipulators.push({
          from: {
            simultaneous: [{ key_code: first }, { key_code: second }],
            simultaneous_options: { key_down_order: "strict" },
          },
          to_if_alone: [{ key_code: first }, { key_code: second }],
          to_if_held_down: held([first, second]),
          type: "basic",
        });
      }
    }

    for (const key of keys) {
      manipulators.push({
        from: { key_code: key },
        to_delayed_action: {
          to_if_canceled: [{ key_code: key }],
          to_if_invoked: [{ key_code: "vk_none" }],
        },
        to_if_alone: [{ halt: true, key_code: key }],
        to_if_held_down: [{ halt: true, key_code: mod(key) }],
        type: "basic",
      });
    }
  }

  return {
    description: "Home row mods (GACS) - ⌘ ⌥ ⌃ ⇧ on asdf / ;lkj",
    manipulators,
  };
}


const rules: KarabinerRules[] = [
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
  homeRowMods(),
];

const parameters: Parameters = {
  "basic.to_if_alone_timeout_milliseconds": 300,
  "basic.to_if_held_down_threshold_milliseconds": 200,
  "basic.to_delayed_action_delay_milliseconds": 200,
  "basic.simultaneous_threshold_milliseconds": 100,
  "mouse_motion_to_scroll.speed": 100,
};

const virtual_hid_keyboard: VirtualHidKeyboard = {
  keyboard_type_v2: "ansi",
};

const devices: Device[] = [
  {
    identifiers: { is_keyboard: true, vendor_id: 13364, product_id: 53296 },
    disable_built_in_keyboard_if_exists: true,
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
    disable_built_in_keyboard_if_exists: true,
    ignore: false,
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

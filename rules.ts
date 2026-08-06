import fs from "fs";
import {
  Conditions,
  KarabinerRules,
  KeyCode,
  Parameters,
  VirtualHidKeyboard,
} from "./types";
import {
  createHyperSubLayers,
  LayerTrigger,
  app,
  open,
  window,
  shell,
} from "./utils";

// Karabiner-MultitouchExtension publishes the number of fingers currently on the
// trackpad as variables, so a touch can stand in for holding a modifier.
// The app has to be running for these to ever be non-zero; when it isn't, every
// variable reads 0 and all of the rules below simply stay inactive.
// https://karabiner-elements.pqrs.org/docs/json/extra/multitouch-extension/
//
// "variable_unless 0" means "at least one finger" — swap it for
// `{ type: "variable_if", ..., value: 2 }` to demand exactly two fingers if a
// resting hand keeps arming these layers by accident.
const trackpadLeftHalf: Conditions = {
  description: "At least one finger on the left half of the trackpad",
  type: "variable_unless",
  name: "multitouch_extension_finger_count_left_half_area",
  value: 0,
};

const trackpadRightHalf: Conditions = {
  description: "At least one finger on the right half of the trackpad",
  type: "variable_unless",
  name: "multitouch_extension_finger_count_right_half_area",
  value: 0,
};

// Touching the left half of the trackpad acts exactly like holding Caps Lock,
// so every Hyper sublayer below works without reaching for a modifier
const trackpadLeftHalfIsHyper: LayerTrigger = {
  description: "Trackpad left half",
  conditions: [trackpadLeftHalf],
};

// Touching the right half opens a second, flat layer: no sublayer key, the
// commands fire directly. Vim-style navigation to start with.
const trackpadRightHalfLayer: [KeyCode, KeyCode][] = [
  ["h", "left_arrow"],
  ["j", "down_arrow"],
  ["k", "up_arrow"],
  ["l", "right_arrow"],
  // Deliberately not on the home row mod keys (a/s/d/f), which this layer would shadow
  ["u", "page_up"],
  ["i", "page_down"],
  ["y", "home"],
  ["n", "end"],
];

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
  ...createHyperSubLayers(
    {
      o: {
        b: app("Brave Browser"),
        s: app("Slack"),
        n: app("Notion"),
        g: app("Ghostty"),
        f: app("Finder"),
        e: app("Microsoft Edge"),
      },
    },
    [trackpadLeftHalfIsHyper]
  ),
  // Must come before the home row mods, which claim j/k/l unconditionally and
  // would otherwise win — Karabiner takes the first matching manipulator
  {
    description: "Trackpad right half -> navigation layer",
    manipulators: trackpadRightHalfLayer.map(([from_key, to_key]) => ({
      description: `${from_key} -> ${to_key}`,
      type: "basic" as const,
      from: {
        key_code: from_key,
        modifiers: {
          optional: ["any"],
        },
      },
      to: [
        {
          key_code: to_key,
        },
      ],
      conditions: [trackpadRightHalf],
    })),
  },
  {
    description: "Home row mods - ctrl,lj opt, cmd, shift",
    manipulators: [
      {
        from: {
          simultaneous: [
            { key_code: "a" },
            { key_code: "s" },
            { key_code: "d" },
            { key_code: "f" },
          ],
        },
        to_if_held_down: [
          {
            key_code: "left_shift",
            modifiers: ["left_command", "left_option", "left_control"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [
            { key_code: "a" },
            { key_code: "s" },
            { key_code: "d" },
          ],
        },
        to_if_held_down: [
          {
            key_code: "left_control",
            modifiers: ["left_command", "left_option"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [
            { key_code: "a" },
            { key_code: "d" },
            { key_code: "f" },
          ],
        },
        to_if_held_down: [
          {
            key_code: "left_shift",
            modifiers: ["left_command", "left_control"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [
            { key_code: "s" },
            { key_code: "d" },
            { key_code: "f" },
          ],
        },
        to_if_held_down: [
          {
            key_code: "left_option",
            modifiers: ["left_command", "left_shift"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "a" }, { key_code: "s" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "a" }, { key_code: "s" }],
        to_if_held_down: [
          {
            key_code: "left_control",
            modifiers: ["left_option"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "s" }, { key_code: "a" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "s" }, { key_code: "a" }],
        to_if_held_down: [
          {
            key_code: "left_control",
            modifiers: ["left_option"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "a" }, { key_code: "d" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "a" }, { key_code: "d" }],
        to_if_held_down: [
          {
            key_code: "left_control",
            modifiers: ["left_command"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "d" }, { key_code: "a" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "d" }, { key_code: "a" }],
        to_if_held_down: [
          {
            key_code: "left_control",
            modifiers: ["left_command"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "a" }, { key_code: "f" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "a" }, { key_code: "f" }],
        to_if_held_down: [
          {
            key_code: "left_control",
            modifiers: ["left_shift"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "f" }, { key_code: "a" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "f" }, { key_code: "a" }],
        to_if_held_down: [
          {
            key_code: "left_control",
            modifiers: ["left_shift"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "s" }, { key_code: "d" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "s" }, { key_code: "d" }],
        to_if_held_down: [
          {
            key_code: "left_option",
            modifiers: ["left_command"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "d" }, { key_code: "s" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "d" }, { key_code: "s" }],
        to_if_held_down: [
          {
            key_code: "left_option",
            modifiers: ["left_command"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "s" }, { key_code: "f" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "s" }, { key_code: "f" }],
        to_if_held_down: [
          {
            key_code: "left_option",
            modifiers: ["left_shift"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "f" }, { key_code: "s" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "f" }, { key_code: "s" }],
        to_if_held_down: [
          {
            key_code: "left_option",
            modifiers: ["left_shift"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "d" }, { key_code: "f" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "d" }, { key_code: "f" }],
        to_if_held_down: [
          {
            key_code: "left_command",
            modifiers: ["left_shift"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "f" }, { key_code: "d" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "f" }, { key_code: "d" }],
        to_if_held_down: [
          {
            key_code: "left_command",
            modifiers: ["left_shift"],
          },
        ],
        type: "basic",
      },
      {
        from: { key_code: "a" },
        to_delayed_action: {
          to_if_canceled: [{ key_code: "a" }],
          to_if_invoked: [{ key_code: "vk_none" }],
        },
        to_if_alone: [{ halt: true, key_code: "a" }],
        to_if_held_down: [{ halt: true, key_code: "left_control" }],
        type: "basic",
      },
      {
        from: { key_code: "s" },
        to_delayed_action: {
          to_if_canceled: [{ key_code: "s" }],
          to_if_invoked: [{ key_code: "vk_none" }],
        },
        to_if_alone: [{ halt: true, key_code: "s" }],
        to_if_held_down: [{ halt: true, key_code: "left_option" }],
        type: "basic",
      },
      {
        from: { key_code: "d" },
        to_delayed_action: {
          to_if_canceled: [{ key_code: "d" }],
          to_if_invoked: [{ key_code: "vk_none" }],
        },
        to_if_alone: [{ halt: true, key_code: "d" }],
        to_if_held_down: [{ halt: true, key_code: "left_command" }],
        type: "basic",
      },
      {
        from: { key_code: "f" },
        to_delayed_action: {
          to_if_canceled: [{ halt: true, key_code: "f" }],
          to_if_invoked: [{ key_code: "vk_none" }],
        },
        to_if_alone: [{ halt: true, key_code: "f" }],
        to_if_held_down: [{ halt: true, key_code: "left_shift" }],
        type: "basic",
      },
      {
        from: {
          simultaneous: [
            { key_code: "j" },
            { key_code: "k" },
            { key_code: "l" },
            { key_code: "semicolon" },
          ],
        },
        to_if_held_down: [
          {
            key_code: "left_shift",
            modifiers: ["left_command", "left_option", "left_control"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [
            { key_code: "semicolon" },
            { key_code: "l" },
            { key_code: "k" },
          ],
        },
        to_if_held_down: [
          {
            key_code: "left_shift",
            modifiers: ["left_option", "left_control"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [
            { key_code: "semicolon" },
            { key_code: "k" },
            { key_code: "j" },
          ],
        },
        to_if_held_down: [
          {
            key_code: "left_shift",
            modifiers: ["left_command", "left_option"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [
            { key_code: "l" },
            { key_code: "k" },
            { key_code: "j" },
          ],
        },
        to_if_held_down: [
          {
            key_code: "left_control",
            modifiers: ["left_command", "left_option"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "semicolon" }, { key_code: "l" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "semicolon" }, { key_code: "l" }],
        to_if_held_down: [
          {
            key_code: "left_control",
            modifiers: ["left_option"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "l" }, { key_code: "semicolon" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "l" }, { key_code: "semicolon" }],
        to_if_held_down: [
          {
            key_code: "left_control",
            modifiers: ["left_option"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "semicolon" }, { key_code: "k" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "semicolon" }, { key_code: "k" }],
        to_if_held_down: [
          {
            key_code: "left_control",
            modifiers: ["left_command"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "k" }, { key_code: "semicolon" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "k" }, { key_code: "semicolon" }],
        to_if_held_down: [
          {
            key_code: "left_control",
            modifiers: ["left_command"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "semicolon" }, { key_code: "j" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "semicolon" }, { key_code: "j" }],
        to_if_held_down: [
          {
            key_code: "left_control",
            modifiers: ["left_shift"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "j" }, { key_code: "semicolon" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "j" }, { key_code: "semicolon" }],
        to_if_held_down: [
          {
            key_code: "left_control",
            modifiers: ["left_shift"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "l" }, { key_code: "k" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "l" }, { key_code: "k" }],
        to_if_held_down: [
          {
            key_code: "left_option",
            modifiers: ["left_command"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "k" }, { key_code: "l" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "k" }, { key_code: "l" }],
        to_if_held_down: [
          {
            key_code: "left_option",
            modifiers: ["left_command"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "l" }, { key_code: "j" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "l" }, { key_code: "j" }],
        to_if_held_down: [
          {
            key_code: "left_option",
            modifiers: ["left_shift"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "j" }, { key_code: "l" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "j" }, { key_code: "l" }],
        to_if_held_down: [
          {
            key_code: "left_option",
            modifiers: ["left_shift"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "k" }, { key_code: "j" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "k" }, { key_code: "j" }],
        to_if_held_down: [
          {
            key_code: "left_command",
            modifiers: ["left_shift"],
          },
        ],
        type: "basic",
      },
      {
        from: {
          simultaneous: [{ key_code: "j" }, { key_code: "k" }],
          simultaneous_options: { key_down_order: "strict" },
        },
        to_if_alone: [{ key_code: "j" }, { key_code: "k" }],
        to_if_held_down: [
          {
            key_code: "left_command",
            modifiers: ["left_shift"],
          },
        ],
        type: "basic",
      },
      {
        from: { key_code: "semicolon" },
        to_delayed_action: {
          to_if_canceled: [{ key_code: "semicolon" }],
          to_if_invoked: [{ key_code: "vk_none" }],
        },
        to_if_alone: [{ halt: true, key_code: "semicolon" }],
        to_if_held_down: [{ halt: true, key_code: "left_control" }],
        type: "basic",
      },
      {
        from: { key_code: "l" },
        to_delayed_action: {
          to_if_canceled: [{ key_code: "l" }],
          to_if_invoked: [{ key_code: "vk_none" }],
        },
        to_if_alone: [{ halt: true, key_code: "l" }],
        to_if_held_down: [{ halt: true, key_code: "left_option" }],
        type: "basic",
      },
      {
        from: { key_code: "k" },
        to_delayed_action: {
          to_if_canceled: [{ key_code: "k" }],
          to_if_invoked: [{ key_code: "vk_none" }],
        },
        to_if_alone: [{ halt: true, key_code: "k" }],
        to_if_held_down: [{ halt: true, key_code: "left_command" }],
        type: "basic",
      },
      {
        from: { key_code: "j" },
        to_delayed_action: {
          to_if_canceled: [{ key_code: "j" }],
          to_if_invoked: [{ key_code: "vk_none" }],
        },
        to_if_alone: [{ halt: true, key_code: "j" }],
        to_if_held_down: [{ halt: true, key_code: "left_shift" }],
        type: "basic",
      },
    ],
  },
];

const parameters: Parameters = {
  "basic.to_if_alone_timeout_milliseconds": 500,
  "basic.to_if_held_down_threshold_milliseconds": 125,
  "basic.to_delayed_action_delay_milliseconds": 200,
  "basic.simultaneous_threshold_milliseconds": 100,
  "mouse_motion_to_scroll.speed": 100,
};

const virtual_hid_keyboard: VirtualHidKeyboard = {
  keyboard_type_v2: "ansi",
};

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

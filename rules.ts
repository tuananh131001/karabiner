import fs from "fs";
import { KarabinerRules, Parameters, VirtualHidKeyboard } from "./types";
import { createHyperSubLayers, app, open, window, shell } from "./utils";

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
  }),
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
        to_if_held_down: [{ halt: true, key_code: "left_command" }],
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
        to_if_held_down: [{ halt: true, key_code: "left_shift" }],
        type: "basic",
      },
      {
        from: { key_code: "f" },
        to_delayed_action: {
          to_if_canceled: [{ halt: true, key_code: "f" }],
          to_if_invoked: [{ key_code: "vk_none" }],
        },
        to_if_alone: [{ halt: true, key_code: "f" }],
        to_if_held_down: [{ halt: true, key_code: "left_control" }],
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
        to_if_held_down: [{ halt: true, key_code: "left_command" }],
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
        to_if_held_down: [{ halt: true, key_code: "left_shift" }],
        type: "basic",
      },
      {
        from: { key_code: "j" },
        to_delayed_action: {
          to_if_canceled: [{ key_code: "j" }],
          to_if_invoked: [{ key_code: "vk_none" }],
        },
        to_if_alone: [{ halt: true, key_code: "j" }],
        to_if_held_down: [{ halt: true, key_code: "left_control" }],
        type: "basic",
      },
    ],
  },
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

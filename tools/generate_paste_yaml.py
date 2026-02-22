#!/usr/bin/env python3
"""
Generate Power Apps .pa.yaml paste-ready YAML for hamburger navigation controls.

Produces one YAML file per screen in tools/paste-yaml/, each containing the 9
(or 10, for screens with a back button) controls that make up the unified
hamburger navigation menu.

Usage:
    python tools/generate_paste_yaml.py
"""

import os
import textwrap

# ---------------------------------------------------------------------------
# Screen definitions
# ---------------------------------------------------------------------------

SCREENS = [
    {
        "name": "DashboardScreen",
        "shorthand": "Dash",
        "highlight": "NavDashboard",
        "back_button": None,
    },
    {
        "name": "TrackerScreen",
        "shorthand": "Tracker",
        "highlight": "NavTracker",
        "back_button": None,
    },
    {
        "name": "IssueDetailScreen",
        "shorthand": "Detail",
        "highlight": None,  # no highlight
        "back_button": {
            "name": "Btn_Detail_BackToTracker",
            "text": "< Tracker",
            "width": 85,
            "on_select": "Navigate(TrackerScreen, ScreenTransition.Fade)",
        },
    },
    {
        "name": "SubmitScreen",
        "shorthand": "Submit",
        "highlight": "NavSubmit",
        "back_button": {
            "name": "Btn_Submit_BackBtn",
            "text": "< Dashboard",
            "width": 100,
            "on_select": "Navigate(DashboardScreen, ScreenTransition.Fade)",
        },
    },
    {
        "name": "GroupAllocationScreen",
        "shorthand": "Group",
        "highlight": "NavGroupAlloc",
        "back_button": None,
    },
    {
        "name": "KanbanScreen",
        "shorthand": "Kanban",
        "highlight": "NavKanban",
        "back_button": None,
    },
]

NAV_BUTTONS = [
    {
        "suffix": "NavDashboard",
        "text": "  Dashboard",
        "y": 55,
        "on_select": "Navigate(DashboardScreen, ScreenTransition.Fade)",
    },
    {
        "suffix": "NavTracker",
        "text": "  Issue Tracker",
        "y": 100,
        "on_select": "Navigate(TrackerScreen, ScreenTransition.Fade)",
    },
    {
        "suffix": "NavGroupAlloc",
        "text": "  Group Allocation",
        "y": 145,
        "on_select": "Navigate(GroupAllocationScreen, ScreenTransition.Fade)",
    },
    {
        "suffix": "NavKanban",
        "text": "  Kanban Board",
        "y": 190,
        "on_select": "Navigate(KanbanScreen, ScreenTransition.Fade)",
    },
    {
        "suffix": "NavSubmit",
        "text": "  Submit New Issue",
        "y": 235,
        "on_select": "Navigate(SubmitScreen, ScreenTransition.Fade)",
    },
]

# ---------------------------------------------------------------------------
# YAML helpers
# ---------------------------------------------------------------------------

def yaml_prop(key: str, value: str, indent: int = 6) -> str:
    """Return a single YAML property line.

    Values containing YAML-sensitive characters ({, }, |, newlines, etc.)
    use the block scalar style (|) to avoid parse errors.
    """
    prefix = " " * indent
    # Determine if block scalar is needed
    needs_block = any(ch in value for ch in ("{", "}", "|", "\n"))
    if needs_block:
        return f"{prefix}{key}: |\n{prefix}  {value}"
    return f"{prefix}{key}: {value}"


def yaml_control_block(name: str, control_type: str, props: list[tuple[str, str]]) -> str:
    """Build a full control block in pa.yaml paste format."""
    lines = [f"- {name}:"]
    lines.append(f"    Control: {control_type}")
    lines.append("    Properties:")
    for key, value in props:
        lines.append(yaml_prop(key, value))
    return "\n".join(lines)

# ---------------------------------------------------------------------------
# Control generators
# ---------------------------------------------------------------------------

def gen_hamburger_button(shorthand: str) -> str:
    name = f"Btn_{shorthand}_HamburgerMenu"
    props = [
        ("Text", '="\\u2630"'),  # We'll fix this below
        ("X", "=10"),
        ("Y", "=8"),
        ("Width", "=45"),
        ("Height", "=40"),
        ("Fill", "=RGBA(0,0,0,0)"),
        ("Color", "=RGBA(255,255,255,1)"),
        ("HoverFill", "=RGBA(180,60,0,1)"),
        ("PressedFill", "=RGBA(150,50,0,1)"),
        ("HoverColor", "=RGBA(255,255,255,1)"),
        ("PressedColor", "=RGBA(255,255,255,1)"),
        ("BorderColor", "=RGBA(0,0,0,0)"),
        ("HoverBorderColor", "=RGBA(0,0,0,0)"),
        ("PressedBorderColor", "=RGBA(0,0,0,0)"),
        ("DisabledBorderColor", "=RGBA(0,0,0,0)"),
        ("Font", "=Font.'Segoe UI'"),
        ("FontWeight", "=FontWeight.Bold"),
        ("Size", "=20"),
        ("OnSelect", "=UpdateContext({varShowNav: !varShowNav})"),
        ("RadiusTopLeft", "=4"),
        ("RadiusTopRight", "=4"),
        ("RadiusBottomLeft", "=4"),
        ("RadiusBottomRight", "=4"),
    ]
    # Use the actual hamburger character in the Text property
    props[0] = ("Text", '="\u2630"')
    return yaml_control_block(name, "Classic/Button@2.2.0", props)


def gen_submit_cta(shorthand: str) -> str:
    name = f"Btn_{shorthand}_SubmitCTA"
    props = [
        ("Text", '="+ Submit New Issue"'),
        ("X", "=1150"),
        ("Y", "=8"),
        ("Width", "=200"),
        ("Height", "=40"),
        ("Fill", "=RGBA(208,74,2,1)"),
        ("Color", "=RGBA(255,255,255,1)"),
        ("HoverFill", "=RGBA(195,76,47,1)"),
        ("PressedFill", "=RGBA(167,69,44,1)"),
        ("HoverColor", "=RGBA(255,255,255,1)"),
        ("PressedColor", "=RGBA(255,255,255,1)"),
        ("BorderColor", "=RGBA(0,0,0,0)"),
        ("HoverBorderColor", "=RGBA(0,0,0,0)"),
        ("PressedBorderColor", "=RGBA(0,0,0,0)"),
        ("DisabledBorderColor", "=RGBA(0,0,0,0)"),
        ("Font", "=Font.'Segoe UI'"),
        ("FontWeight", "=FontWeight.Semibold"),
        ("Size", "=13"),
        ("OnSelect", "=Navigate(SubmitScreen, ScreenTransition.Fade)"),
        ("RadiusTopLeft", "=4"),
        ("RadiusTopRight", "=4"),
        ("RadiusBottomLeft", "=4"),
        ("RadiusBottomRight", "=4"),
    ]
    return yaml_control_block(name, "Classic/Button@2.2.0", props)


def gen_nav_overlay(shorthand: str) -> str:
    name = f"Rect_{shorthand}_NavOverlay"
    props = [
        ("X", "=0"),
        ("Y", "=0"),
        ("Width", "=1366"),
        ("Height", "=768"),
        ("Fill", "=RGBA(0,0,0,0.4)"),
        ("Visible", "=varShowNav"),
        ("OnSelect", "=UpdateContext({varShowNav: false})"),
    ]
    return yaml_control_block(name, "Rectangle", props)


def gen_nav_dropdown(shorthand: str) -> str:
    name = f"Rect_{shorthand}_NavDropdown"
    props = [
        ("X", "=0"),
        ("Y", "=55"),
        ("Width", "=260"),
        ("Height", "=225"),
        ("Fill", "=RGBA(255,255,255,1)"),
        ("Visible", "=varShowNav"),
        ("BorderColor", "=RGBA(200,200,200,1)"),
        ("BorderThickness", "=1"),
    ]
    return yaml_control_block(name, "Rectangle", props)


def gen_nav_button(shorthand: str, nav: dict, is_highlighted: bool) -> str:
    name = f"Btn_{shorthand}_{nav['suffix']}"

    if is_highlighted:
        fill = "=RGBA(210,215,226,1)"
        color = "=RGBA(65,83,133,1)"
        font_weight = "=FontWeight.Bold"
    else:
        fill = "=RGBA(255,255,255,1)"
        color = "=RGBA(45,45,45,1)"
        font_weight = "=FontWeight.Normal"

    props = [
        ("Text", f'="{nav["text"]}"'),
        ("X", "=0"),
        ("Y", f"={nav['y']}"),
        ("Width", "=260"),
        ("Height", "=45"),
        ("Fill", fill),
        ("Color", color),
        ("HoverFill", "=RGBA(240,240,240,1)"),
        ("PressedFill", "=RGBA(210,215,226,1)"),
        ("HoverColor", "=RGBA(45,45,45,1)"),
        ("PressedColor", "=RGBA(45,45,45,1)"),
        ("BorderColor", "=RGBA(0,0,0,0)"),
        ("HoverBorderColor", "=RGBA(0,0,0,0)"),
        ("PressedBorderColor", "=RGBA(0,0,0,0)"),
        ("DisabledBorderColor", "=RGBA(0,0,0,0)"),
        ("Font", "=Font.'Segoe UI'"),
        ("FontWeight", font_weight),
        ("Size", "=14"),
        ("Visible", "=varShowNav"),
        ("Align", "=Align.Left"),
        ("PaddingLeft", "=20"),
        ("OnSelect", f"={nav['on_select']}"),
        ("RadiusTopLeft", "=0"),
        ("RadiusTopRight", "=0"),
        ("RadiusBottomLeft", "=0"),
        ("RadiusBottomRight", "=0"),
    ]
    return yaml_control_block(name, "Classic/Button@2.2.0", props)


def gen_back_button(back: dict) -> str:
    props = [
        ("Text", f'="{back["text"]}"'),
        ("X", "=60"),
        ("Y", "=10"),
        ("Width", f"={back['width']}"),
        ("Height", "=35"),
        ("Fill", "=RGBA(0,0,0,0)"),
        ("Color", "=RGBA(255,255,255,1)"),
        ("HoverFill", "=RGBA(240,240,240,1)"),
        ("PressedFill", "=RGBA(210,215,226,1)"),
        ("HoverColor", "=RGBA(45,45,45,1)"),
        ("PressedColor", "=RGBA(45,45,45,1)"),
        ("BorderColor", "=RGBA(0,0,0,0)"),
        ("HoverBorderColor", "=RGBA(0,0,0,0)"),
        ("PressedBorderColor", "=RGBA(0,0,0,0)"),
        ("DisabledBorderColor", "=RGBA(0,0,0,0)"),
        ("Font", "=Font.'Segoe UI'"),
        ("Size", "=12"),
        ("OnSelect", f"={back['on_select']}"),
        ("RadiusTopLeft", "=4"),
        ("RadiusTopRight", "=4"),
        ("RadiusBottomLeft", "=4"),
        ("RadiusBottomRight", "=4"),
    ]
    return yaml_control_block(back["name"], "Classic/Button@2.2.0", props)

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def generate_screen_yaml(screen: dict) -> str:
    """Generate the full paste-ready YAML for one screen."""
    shorthand = screen["shorthand"]
    highlight = screen["highlight"]

    blocks = []

    # 1. Hamburger button
    blocks.append(gen_hamburger_button(shorthand))

    # 2. Submit CTA
    blocks.append(gen_submit_cta(shorthand))

    # 3. Nav overlay rectangle
    blocks.append(gen_nav_overlay(shorthand))

    # 4. Nav dropdown rectangle
    blocks.append(gen_nav_dropdown(shorthand))

    # 5-9. Five nav buttons
    for nav in NAV_BUTTONS:
        is_highlighted = (nav["suffix"] == highlight)
        blocks.append(gen_nav_button(shorthand, nav, is_highlighted))

    # 10. Back button (only IssueDetailScreen and SubmitScreen)
    if screen["back_button"]:
        blocks.append(gen_back_button(screen["back_button"]))

    return "\n\n".join(blocks) + "\n"


def main():
    output_dir = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "paste-yaml"
    )
    os.makedirs(output_dir, exist_ok=True)

    for screen in SCREENS:
        yaml_content = generate_screen_yaml(screen)
        filename = f"{screen['name']}.yaml"
        filepath = os.path.join(output_dir, filename)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(yaml_content)

        # Print to stdout with a clear header
        control_count = 10 if screen["back_button"] else 9
        print("=" * 72)
        print(f"  {screen['name']} ({control_count} controls)")
        print(f"  -> {filepath}")
        print("=" * 72)
        print(yaml_content)

    print("=" * 72)
    print(f"  Done. {len(SCREENS)} files written to {output_dir}/")
    print("=" * 72)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Add unified hamburger navigation menu to all 6 screens of the OFR Issue Tracker.

This script edits the unpacked .fx.yaml source files to:
1. Remove old inline navigation buttons
2. Update header bar properties (orange fill, 55px height)
3. Add 9 hamburger nav controls per screen
4. Add back buttons on IssueDetailScreen and SubmitScreen
5. Add OnVisible with varShowNav: false
6. Update EditorState JSON files for new/removed controls
"""

import re
import json
import os
import copy

SOURCES_DIR = "/Users/davidmartin/Projects/OFR-Issue-Tracker/msapp-sources"
SRC_DIR = os.path.join(SOURCES_DIR, "Src")
EDITOR_STATE_DIR = os.path.join(SRC_DIR, "EditorState")

# Screen configurations
SCREENS = {
    "DashboardScreen": {
        "shorthand": "Dash",
        "highlight_nav": "NavDashboard",  # Which nav button to highlight
        "back_button": None,
        "header_bar_name": "Rect_Dash_HeaderBar",
        "title_label_name": "lbl_OneFirmRiskTracker",
        "title_text": '"One Firm Risk Tracker"',
        "title_x": 60,
        "title_width": 400,
        "old_nav_buttons": ["Btn_Submit_New", "Btn_View_Tracker", "Btn_Kanban", "Btn_Grp_Allocation"],
        "onvisible_extra": "UpdateContext({varShowNewIssue: false, showIntakePanel: false, varShowNav: false});\nRefresh(OFR_Issues);\nRefresh(OFR_IntakeQueue)",
    },
    "TrackerScreen": {
        "shorthand": "Tracker",
        "highlight_nav": "NavTracker",
        "back_button": None,
        "header_bar_name": "Rect_Tracker_HeaderBar",
        "title_label_name": "Lbl_Tracker_Title",
        "title_text": '"Issue Tracker"',
        "title_x": 60,
        "title_width": 400,
        "old_nav_buttons": ["Btn_Tracker_Dashboard", "Btn_Tracker_SubmitNew"],
        "onvisible_extra": "UpdateContext({varShowNav: false})",
    },
    "IssueDetailScreen": {
        "shorthand": "Detail",
        "highlight_nav": None,  # No highlight (detail view)
        "back_button": {
            "name": "Btn_Detail_BackToTracker",
            "text": '"< Tracker"',
            "x": 60,
            "width": 85,
            "onselect": "Navigate(TrackerScreen, ScreenTransition.None)",
        },
        "header_bar_name": "Rect_Detail_HeaderBar",
        "title_label_name": "Lbl_Detail_Title",
        "title_text": '"Issue Detail: " & varSelectedIssue.ItemID',
        "title_x": 150,
        "title_width": 600,
        "old_nav_buttons": ["Btn_Detail_BackToTracker"],
        "onvisible_extra": "UpdateContext({varShowNav: false})",
    },
    "SubmitScreen": {
        "shorthand": "Submit",
        "highlight_nav": "NavSubmit",
        "back_button": {
            "name": "Btn_Submit_BackBtn",
            "text": '"< Dashboard"',
            "x": 60,
            "width": 100,
            "onselect": "Navigate(DashboardScreen)",
        },
        "header_bar_name": "Rectangle1",  # Will need special handling - rename to rectSubmitHeader
        "new_header_bar_name": "Rect_Submit_Header",
        "title_label_name": "Lbl_Submit_HeaderTitle",
        "title_text": '"Submit New Issue"',
        "title_x": 165,
        "title_width": 400,
        "old_nav_buttons": ["Btn_Submit_Dashboard"],
        "onvisible_extra": "UpdateContext({varShowNav: false})",
    },
    "GroupAllocationScreen": {
        "shorthand": "Group",
        "highlight_nav": "NavGroupAlloc",
        "back_button": None,
        "header_bar_name": "Rect_Group_HeaderBar",
        "title_label_name": "Lbl_Group_Title",
        "title_text": '"Group Allocation"',
        "title_x": 60,
        "title_width": 300,
        "old_nav_buttons": ["Btn_Group_Dashboard", "Btn_Group_Kanban", "Btn_Group_Tracker", "Btn_Group_SubmitNew"],
        "onvisible_extra": "UpdateContext({varShowNav: false})",
    },
    "KanbanScreen": {
        "shorthand": "Kanban",
        "highlight_nav": "NavKanban",
        "back_button": None,
        "header_bar_name": "Rect_Kanban_HeaderBar",
        "title_label_name": "Lbl_Kanban_Title",
        "title_text": '"Kanban Board"',
        "title_x": 60,
        "title_width": 250,
        "old_nav_buttons": ["Btn_Kanban_GrpAllocation", "Btn_Kanban_Dashboard", "Btn_Kanban_Tracker", "Btn_Kanban_SubmitNew"],
        "onvisible_extra": "UpdateContext({varShowNav: false})",
    },
}


def generate_hamburger_button(shorthand, zindex):
    """Generate the hamburger menu button YAML."""
    return f"""    Btn_{shorthand}_HamburgerMenu As button:
        BorderColor: =RGBA(0, 0, 0, 0)
        BorderThickness: =0
        Color: =Color.White
        DisabledBorderColor: =RGBA(0, 0, 0, 0)
        DisabledColor: =RGBA(166, 166, 166, 1)
        DisabledFill: =RGBA(244, 244, 244, 1)
        Fill: =Color.Transparent
        FocusedBorderColor: =ColorFade(Self.Fill, -75%)
        Font: =Font.'Segoe UI'
        Height: =40
        HoverBorderColor: =RGBA(0, 0, 0, 0)
        HoverColor: =Color.White
        HoverFill: =RGBA(195, 76, 47, 1)
        OnSelect: =UpdateContext({{varShowNav: !varShowNav}})
        PressedBorderColor: =RGBA(0, 0, 0, 0)
        PressedColor: =Color.White
        PressedFill: =RGBA(167, 69, 44, 1)
        Size: =22
        Text: =Char(9776)
        Width: =45
        X: =10
        Y: =8
        ZIndex: ={zindex}
"""


def generate_submit_cta(shorthand, zindex):
    """Generate the Submit CTA button YAML."""
    return f"""    Btn_{shorthand}_SubmitCTA As button:
        BorderColor: =RGBA(0, 0, 0, 0)
        Color: =RGBA(208, 74, 2, 1)
        DisabledBorderColor: =RGBA(0, 0, 0, 0)
        DisabledColor: =RGBA(166, 166, 166, 1)
        DisabledFill: =RGBA(244, 244, 244, 1)
        Fill: =Color.White
        FocusedBorderColor: =ColorFade(Self.Fill, -75%)
        Font: =Font.'Segoe UI'
        FontWeight: =FontWeight.Semibold
        Height: =35
        HoverBorderColor: =RGBA(0, 0, 0, 0)
        HoverColor: =RGBA(208, 74, 2, 1)
        HoverFill: =RGBA(240, 240, 240, 1)
        OnSelect: =Navigate(SubmitScreen)
        PressedBorderColor: =RGBA(0, 0, 0, 0)
        PressedColor: =RGBA(208, 74, 2, 1)
        PressedFill: =RGBA(210, 215, 226, 1)
        RadiusBottomLeft: =6
        RadiusBottomRight: =6
        RadiusTopLeft: =6
        RadiusTopRight: =6
        Size: =12
        Text: ="+ Submit New Issue"
        Width: =180
        X: =1170
        Y: =10
        ZIndex: ={zindex}
"""


def generate_nav_overlay(shorthand, zindex):
    """Generate the transparent overlay rectangle YAML."""
    return f"""    Rect_{shorthand}_NavOverlay As rectangle:
        BorderColor: =RGBA(0, 0, 0, 0)
        BorderStyle: =BorderStyle.None
        Fill: =RGBA(0, 0, 0, 0.01)
        Height: =768
        OnSelect: =UpdateContext({{varShowNav: false}})
        Visible: =varShowNav
        Width: =1366
        ZIndex: ={zindex}
"""


def generate_nav_dropdown(shorthand, zindex):
    """Generate the dropdown panel rectangle YAML."""
    return f"""    Rect_{shorthand}_NavDropdown As rectangle:
        BorderColor: =RGBA(200, 200, 200, 1)
        BorderStyle: =BorderStyle.Solid
        BorderThickness: =1
        Fill: =Color.White
        Height: =220
        RadiusBottomLeft: =8
        RadiusBottomRight: =8
        Visible: =varShowNav
        Width: =250
        X: =10
        Y: =55
        ZIndex: ={zindex}
"""


def generate_nav_button(shorthand, nav_name, y, text, screen_name, is_highlighted, zindex):
    """Generate a single nav item button YAML."""
    if is_highlighted:
        fill = "=RGBA(210, 215, 226, 1)"
        color = "=RGBA(65, 83, 133, 1)"
        font_weight = "=FontWeight.Bold"
    else:
        fill = "=Color.Transparent"
        color = "=RGBA(45, 45, 45, 1)"
        font_weight = "=FontWeight.Normal"

    return f"""    Btn_{shorthand}_{nav_name} As button:
        Align: =Align.Left
        BorderColor: =RGBA(0, 0, 0, 0)
        BorderThickness: =0
        Color: {color}
        DisabledBorderColor: =RGBA(0, 0, 0, 0)
        DisabledColor: =RGBA(166, 166, 166, 1)
        DisabledFill: =RGBA(244, 244, 244, 1)
        Fill: {fill}
        FocusedBorderColor: =ColorFade(Self.Fill, -75%)
        Font: =Font.'Segoe UI'
        FontWeight: {font_weight}
        Height: =40
        HoverBorderColor: =RGBA(0, 0, 0, 0)
        HoverColor: =RGBA(45, 45, 45, 1)
        HoverFill: =RGBA(240, 240, 240, 1)
        OnSelect: =UpdateContext({{varShowNav: false}}); Navigate({screen_name})
        PaddingLeft: =15
        PressedBorderColor: =RGBA(0, 0, 0, 0)
        PressedColor: =RGBA(45, 45, 45, 1)
        PressedFill: =RGBA(210, 215, 226, 1)
        Size: =13
        Text: ="{text}"
        Visible: =varShowNav
        Width: =250
        X: =10
        Y: ={y}
        ZIndex: ={zindex}
"""


def generate_back_button(name, text, x, width, onselect, zindex):
    """Generate a back button YAML."""
    return f"""    {name} As button:
        BorderColor: =RGBA(0, 0, 0, 0)
        BorderThickness: =0
        Color: =Color.White
        DisabledBorderColor: =RGBA(0, 0, 0, 0)
        DisabledColor: =RGBA(166, 166, 166, 1)
        DisabledFill: =RGBA(244, 244, 244, 1)
        Fill: =Color.Transparent
        FocusedBorderColor: =ColorFade(Self.Fill, -75%)
        Font: =Font.'Segoe UI'
        FontWeight: =FontWeight.Semibold
        Height: =32
        HoverBorderColor: =RGBA(0, 0, 0, 0)
        HoverColor: =Color.White
        HoverFill: =RGBA(240, 240, 240, 1)
        OnSelect: ={onselect}
        PressedBorderColor: =RGBA(0, 0, 0, 0)
        PressedColor: =Color.White
        PressedFill: =RGBA(210, 215, 226, 1)
        Size: =12
        Text: ={text}
        Width: ={width}
        X: ={x}
        Y: =12
        ZIndex: ={zindex}
"""


# Nav button definitions: (nav_name, Y, text, target_screen)
NAV_BUTTONS = [
    ("NavDashboard", 55, "  Dashboard", "DashboardScreen"),
    ("NavTracker", 95, "  Issue Tracker", "TrackerScreen"),
    ("NavGroupAlloc", 135, "  Group Allocation", "GroupAllocationScreen"),
    ("NavKanban", 175, "  Kanban Board", "KanbanScreen"),
    ("NavSubmit", 215, "  Submit New Issue", "SubmitScreen"),
]


def make_editor_state_entry(name, parent_index):
    """Create a minimal EditorState entry for a new button control."""
    return {
        "AllowAccessToGlobals": True,
        "ControlPropertyState": [
            "OnSelect",
            "AutoDisableOnSelect",
            "Text",
            "Tooltip",
            "ContentLanguage",
            "BorderColor",
            "RadiusTopLeft",
            "RadiusTopRight",
            "RadiusBottomLeft",
            "RadiusBottomRight",
            "DisabledBorderColor",
            "PressedBorderColor",
            "HoverBorderColor",
            "BorderStyle",
            "BorderThickness",
            "FocusedBorderColor",
            "FocusedBorderThickness",
            "Color",
            "DisabledColor",
            "PressedColor",
            "HoverColor",
            "DisplayMode",
            "Fill",
            "DisabledFill",
            "PressedFill",
            "HoverFill",
            "Font",
            "Size",
            "FontWeight",
            "Italic",
            "Underline",
            "Strikethrough",
            "Align",
            "PaddingTop",
            "PaddingRight",
            "PaddingBottom",
            "PaddingLeft",
            "Visible",
            "VerticalAlign",
            "X",
            "Y",
            "Width",
            "Height",
            "TabIndex",
            "maximumHeight",
            "maximumWidth",
            "minimumHeight",
            "minimumWidth",
            "ZIndex",
        ],
        "HasDynamicProperties": False,
        "IsAutoGenerated": False,
        "IsComponentDefinition": False,
        "IsDataControl": False,
        "IsFromScreenLayout": False,
        "IsGroupControl": False,
        "IsLocked": False,
        "LayoutName": "",
        "MetaDataIDKey": "",
        "Name": name,
        "OptimizeForDevices": "Off",
        "ParentIndex": parent_index,
        "PersistMetaDataIDKey": False,
        "Properties": [
            {"Category": "Data", "PropertyName": "Text", "RuleProviderType": "Unknown"},
            {"Category": "Data", "PropertyName": "Tooltip", "RuleProviderType": "Unknown"},
            {"Category": "Data", "PropertyName": "ContentLanguage", "RuleProviderType": "Unknown"},
        ],
        "StyleName": "defaultButtonStyle",
        "Type": "ControlInfo",
    }


def make_editor_state_entry_rectangle(name, parent_index):
    """Create a minimal EditorState entry for a new rectangle control."""
    return {
        "AllowAccessToGlobals": True,
        "ControlPropertyState": [
            "OnSelect",
            "BorderColor",
            "RadiusTopLeft",
            "RadiusTopRight",
            "RadiusBottomLeft",
            "RadiusBottomRight",
            "DisabledBorderColor",
            "HoverBorderColor",
            "PressedBorderColor",
            "FocusedBorderColor",
            "FocusedBorderThickness",
            "BorderStyle",
            "BorderThickness",
            "Fill",
            "DisabledFill",
            "PressedFill",
            "HoverFill",
            "Visible",
            "X",
            "Y",
            "Width",
            "Height",
            "ZIndex",
        ],
        "HasDynamicProperties": False,
        "IsAutoGenerated": False,
        "IsComponentDefinition": False,
        "IsDataControl": False,
        "IsFromScreenLayout": False,
        "IsGroupControl": False,
        "IsLocked": False,
        "LayoutName": "",
        "MetaDataIDKey": "",
        "Name": name,
        "OptimizeForDevices": "Off",
        "ParentIndex": parent_index,
        "PersistMetaDataIDKey": False,
        "Properties": [],
        "StyleName": "defaultRectangleStyle",
        "Type": "ControlInfo",
    }


def remove_control_from_yaml(content, control_name):
    """Remove a top-level control block from fx.yaml content.

    A top-level control starts with '    ControlName As type:' (4-space indent)
    and continues until the next top-level control or end of file.
    """
    lines = content.split('\n')
    result_lines = []
    skip = False

    for line in lines:
        # Check if this line starts a top-level control definition
        # Pattern: "    ControlName As type:" (exactly 4 spaces indent)
        if re.match(r'^    \S', line) and ' As ' in line:
            current_control = line.strip().split(' As ')[0].strip('"')
            if current_control == control_name:
                skip = True
                continue
            else:
                skip = False

        # If we're inside a skipped control block, check indent level
        if skip:
            # Top-level controls have 4-space indent, their properties have 8-space
            # A blank line within a control block should also be skipped
            if line == '' or line.startswith('        ') or line.startswith('    '):
                # Still inside the skipped control (sub-properties or blank line within)
                # But only if the line doesn't start a new top-level control
                if re.match(r'^    \S', line) and ' As ' in line:
                    skip = False
                    result_lines.append(line)
                else:
                    continue
            else:
                skip = False
                result_lines.append(line)
        else:
            result_lines.append(line)

    return '\n'.join(result_lines)


def find_max_zindex(content):
    """Find the maximum ZIndex value in the YAML content."""
    matches = re.findall(r'ZIndex:\s*=(\d+)', content)
    if matches:
        return max(int(m) for m in matches)
    return 0


def update_header_bar(content, header_name, new_name=None):
    """Update the header bar rectangle properties to match the spec.

    Changes: Fill to RGBA(208,74,2,1), Height to 55.
    Only modifies properties at exactly 8-space indent (direct children of control).
    """
    lines = content.split('\n')
    result_lines = []
    in_header = False
    skip_block_continuation = False

    for line in lines:
        # Check for top-level control definition (4-space indent)
        if re.match(r'^    \S', line) and ' As ' in line:
            current_control = line.strip().split(' As ')[0].strip('"')
            if current_control == header_name:
                in_header = True
                skip_block_continuation = False
                if new_name:
                    line = line.replace(header_name, new_name)
                result_lines.append(line)
                continue
            else:
                in_header = False
                skip_block_continuation = False

        if skip_block_continuation:
            if re.match(r'^        \s+=', line):
                continue
            skip_block_continuation = False

        if in_header and re.match(r'^        \S', line):
            prop = line.strip().split(':')[0]
            if prop == 'Fill':
                if '|' in line:
                    skip_block_continuation = True
                result_lines.append('        Fill: =RGBA(208, 74, 2, 1)')
                continue
            if prop == 'Height':
                result_lines.append('        Height: =55')
                continue
            if prop == 'HoverFill':
                if '|' in line:
                    skip_block_continuation = True
                result_lines.append('        HoverFill: =RGBA(208, 74, 2, 1)')
                continue
            if prop == 'PressedFill':
                if '|' in line:
                    skip_block_continuation = True
                result_lines.append('        PressedFill: =RGBA(208, 74, 2, 1)')
                continue
            if prop == 'DisabledFill':
                if '|' in line:
                    skip_block_continuation = True
                result_lines.append('        DisabledFill: =RGBA(208, 74, 2, 1)')
                continue

        result_lines.append(line)

    return '\n'.join(result_lines)


def update_title_label(content, title_name, title_text, title_x, title_width):
    """Update the title label properties.

    Only modifies properties at exactly 8-space indent (direct children
    of the top-level control), not deeper-nested properties in gallery children.
    Properly handles YAML block scalar continuation lines (| or |-).
    """
    lines = content.split('\n')
    result_lines = []
    in_title = False
    skip_block_continuation = False

    for line in lines:
        # Check if this line starts a top-level control definition (4-space indent)
        if re.match(r'^    \S', line) and ' As ' in line:
            current_control = line.strip().split(' As ')[0].strip('"')
            if current_control == title_name:
                in_title = True
                skip_block_continuation = False
                result_lines.append(line)
                continue
            else:
                in_title = False
                skip_block_continuation = False

        if skip_block_continuation:
            # Skip continuation lines of a YAML block scalar we replaced
            # Continuation lines are at 12+ spaces indent (deeper than 8-space property)
            if re.match(r'^            ', line):
                continue
            skip_block_continuation = False

        if in_title and re.match(r'^        \S', line):
            # Only modify properties at exactly 8-space indent
            prop = line.strip().split(':')[0]
            if prop == 'X':
                result_lines.append(f'        X: ={title_x}')
                continue
            if prop == 'Width':
                result_lines.append(f'        Width: ={title_width}')
                continue
            if prop == 'Color':
                if '|' in line:
                    skip_block_continuation = True
                result_lines.append('        Color: =Color.White')
                continue
            if prop == 'Fill':
                if '|' in line:
                    skip_block_continuation = True
                result_lines.append('        Fill: =Color.Transparent')
                continue
            if prop == 'Text':
                if '|' in line:
                    skip_block_continuation = True
                result_lines.append(f'        Text: ={title_text}')
                continue
            if prop == 'Size':
                result_lines.append('        Size: =20')
                continue
            if prop == 'FontWeight':
                result_lines.append('        FontWeight: =FontWeight.Bold')
                continue
            if prop == 'Height':
                result_lines.append('        Height: =35')
                continue
            if prop == 'Y':
                result_lines.append('        Y: =10')
                continue

        result_lines.append(line)

    return '\n'.join(result_lines)


def add_onvisible(content, screen_name, onvisible_formula):
    """Add or update the OnVisible property for a screen.

    In .fx.yaml format, multi-statement formulas use |- block scalar
    with a single line starting with = containing all statements separated by ;
    """
    # Collapse multi-line formulas into a single line separated by ;\n
    # The .fx.yaml format uses |- with a single line starting with =
    formula_single_line = onvisible_formula.replace('\n', ' ')

    lines = content.split('\n')
    result_lines = []

    # Check if OnVisible already exists
    has_onvisible = any('OnVisible:' in line for line in lines)

    if has_onvisible:
        # Update existing OnVisible
        in_onvisible = False
        for line in lines:
            if line.strip().startswith('OnVisible:'):
                in_onvisible = True
                result_lines.append('    OnVisible: |-')
                result_lines.append(f'        ={formula_single_line}')
                continue
            if in_onvisible:
                # Skip continuation lines of old OnVisible
                if line.startswith('        '):
                    continue
                in_onvisible = False
            result_lines.append(line)
    else:
        # Add OnVisible after the screen header properties
        for i, line in enumerate(lines):
            result_lines.append(line)
            # Add after LoadingSpinnerColor (last screen-level property before controls)
            if line.strip().startswith('LoadingSpinnerColor:'):
                result_lines.append('    OnVisible: |-')
                result_lines.append(f'        ={formula_single_line}')

    return '\n'.join(result_lines)


def process_screen(screen_name, config):
    """Process a single screen: remove old nav, add hamburger nav."""
    fx_path = os.path.join(SRC_DIR, f"{screen_name}.fx.yaml")
    editor_path = os.path.join(EDITOR_STATE_DIR, f"{screen_name}.editorstate.json")

    print(f"\n{'='*60}")
    print(f"Processing {screen_name} (shorthand: {config['shorthand']})")
    print(f"{'='*60}")

    # Read fx.yaml
    with open(fx_path, 'r') as f:
        content = f.read()

    # Read editor state
    with open(editor_path, 'r') as f:
        editor_state = json.load(f)

    # 1. Remove old inline nav buttons
    for btn_name in config['old_nav_buttons']:
        print(f"  Removing old button: {btn_name}")
        content = remove_control_from_yaml(content, btn_name)
        # Also remove from editor state
        if btn_name in editor_state.get('ControlStates', {}):
            del editor_state['ControlStates'][btn_name]

    # 2. Update header bar properties
    new_header_name = config.get('new_header_bar_name')
    print(f"  Updating header bar: {config['header_bar_name']}")
    content = update_header_bar(content, config['header_bar_name'], new_header_name)

    # If header was renamed, update editor state
    if new_header_name:
        cs = editor_state.get('ControlStates', {})
        if config['header_bar_name'] in cs:
            cs[new_header_name] = cs.pop(config['header_bar_name'])
            cs[new_header_name]['Name'] = new_header_name

    # 3. Update title label
    print(f"  Updating title label: {config['title_label_name']}")
    content = update_title_label(
        content,
        config['title_label_name'],
        config['title_text'],
        config['title_x'],
        config['title_width'],
    )

    # 4. Add OnVisible
    print(f"  Setting OnVisible")
    content = add_onvisible(content, screen_name, config['onvisible_extra'])

    # 5. Find max ZIndex for adding new controls
    max_z = find_max_zindex(content)
    print(f"  Current max ZIndex: {max_z}")

    shorthand = config['shorthand']
    new_controls_yaml = ""
    new_control_names = []
    z = max_z + 1

    # 6. Add back button if needed (before hamburger nav, as it's part of the header)
    if config['back_button']:
        bb = config['back_button']
        print(f"  Adding back button: {bb['name']}")
        new_controls_yaml += generate_back_button(
            bb['name'], bb['text'], bb['x'], bb['width'], bb['onselect'], z
        )
        new_control_names.append(bb['name'])
        z += 1

    # 7. Add hamburger menu button
    print(f"  Adding Btn_{shorthand}_HamburgerMenu")
    new_controls_yaml += generate_hamburger_button(shorthand, z)
    new_control_names.append(f"Btn_{shorthand}_HamburgerMenu")
    z += 1

    # 8. Add Submit CTA
    print(f"  Adding Btn_{shorthand}_SubmitCTA")
    new_controls_yaml += generate_submit_cta(shorthand, z)
    new_control_names.append(f"Btn_{shorthand}_SubmitCTA")
    z += 1

    # 9. Add overlay (must be after other content, before dropdown)
    print(f"  Adding Rect_{shorthand}_NavOverlay")
    new_controls_yaml += generate_nav_overlay(shorthand, z)
    new_control_names.append(f"Rect_{shorthand}_NavOverlay")
    z += 1

    # 10. Add dropdown panel
    print(f"  Adding Rect_{shorthand}_NavDropdown")
    new_controls_yaml += generate_nav_dropdown(shorthand, z)
    new_control_names.append(f"Rect_{shorthand}_NavDropdown")
    z += 1

    # 11. Add 5 nav buttons
    for nav_name, y, text, target_screen in NAV_BUTTONS:
        is_highlighted = (nav_name == config['highlight_nav'])
        full_name = f"Btn_{shorthand}_{nav_name}"
        print(f"  Adding {full_name} (highlighted={is_highlighted})")
        new_controls_yaml += generate_nav_button(
            shorthand, nav_name, y, text, target_screen, is_highlighted, z
        )
        new_control_names.append(full_name)
        z += 1

    # 12. Append new controls to end of file
    # Remove trailing newlines, add controls, then trailing newline
    content = content.rstrip('\n') + '\n\n' + new_controls_yaml.rstrip('\n') + '\n'

    # 13. Update editor state for new controls
    # Determine parent index (count of existing top-level controls)
    existing_controls = len(editor_state.get('ControlStates', {}))
    for i, ctrl_name in enumerate(new_control_names):
        if ctrl_name.startswith('Rect_'):
            entry = make_editor_state_entry_rectangle(ctrl_name, existing_controls + i)
        else:
            entry = make_editor_state_entry(ctrl_name, existing_controls + i)
        editor_state['ControlStates'][ctrl_name] = entry

    # Write updated fx.yaml
    with open(fx_path, 'w') as f:
        f.write(content)
    print(f"  Written: {fx_path}")

    # Write updated editor state
    with open(editor_path, 'w') as f:
        json.dump(editor_state, f, indent=2)
    print(f"  Written: {editor_path}")

    print(f"  Added {len(new_control_names)} new controls (ZIndex {max_z+1} to {z-1})")


def main():
    print("=" * 60)
    print("OFR Issue Tracker — Hamburger Navigation Menu Builder")
    print("=" * 60)

    # Backup originals
    backup_dir = os.path.join(SOURCES_DIR, "_backup")
    os.makedirs(backup_dir, exist_ok=True)

    for screen_name in SCREENS:
        fx_src = os.path.join(SRC_DIR, f"{screen_name}.fx.yaml")
        fx_bak = os.path.join(backup_dir, f"{screen_name}.fx.yaml.bak")
        es_src = os.path.join(EDITOR_STATE_DIR, f"{screen_name}.editorstate.json")
        es_bak = os.path.join(backup_dir, f"{screen_name}.editorstate.json.bak")

        with open(fx_src, 'r') as f:
            data = f.read()
        with open(fx_bak, 'w') as f:
            f.write(data)

        with open(es_src, 'r') as f:
            data = f.read()
        with open(es_bak, 'w') as f:
            f.write(data)

    print(f"\nBackups saved to {backup_dir}")

    # Process each screen
    for screen_name, config in SCREENS.items():
        process_screen(screen_name, config)

    print("\n" + "=" * 60)
    print("DONE! All 6 screens updated.")
    print("=" * 60)
    print("\nNext steps:")
    print("  1. Review the changes in the .fx.yaml files")
    print("  2. Run: pac canvas pack --sources msapp-sources --msapp OFR-Issue-Tracker-updated.msapp")
    print("  3. Upload the .msapp back to Power Apps")


if __name__ == "__main__":
    main()

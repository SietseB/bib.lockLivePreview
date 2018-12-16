Brackets - Locked Live Preview
==============================

A [Brackets](http://brackets.io/) extension that let you pin the Live Preview to a specific file. This prevents Live Preview switching to an other page when you switch documents in the editor.

Brackets' Live Preview is truly great, but it always follows the active document in the editor. Sometimes that's annoying, e.g. in PHP projects, working on server side scripts that handle ajax calls. That's not the kind of script you want to be executed in the browser.

**NOTE:** This extension is experimental. There is a (small) chance functionality will break in future releases of Brackets.

**NOTE:** At the moment the extension doesn't work with the Multi Browser Live Preview (preview in browsers other than Chrome).

## How to use

Open the page you want to preview in the editor. 

Click on the **Locked Live Preview icon** in the main toolbar (see screenshot below). 

Or in the main menu, select **File > Locked Live Preview**. 

Or use the shortcut **Ctrl-Alt-Shift-P**.

The page will launch in the Live Preview (as normal), but is pinned. You can switch to other documents in the editor without disturbing your preview.

![Screenshot](https://github.com/sietseb/bib.lockLivePreview/blob/master/screenshots/screen-1.png)

The icon works like a switch.

First click: launch Locked Live Preview on the active page in the editor.

Second click: deactivate Locked Live Preview.

Do you want to switch to an other page in the Locked Live Preview? Click on the dimmed yellow icon and the Locked Live Preview will switch to the active page in the editor.


## Installation

#### Extension Manager
1. Under main menu select **File > Extension Manager...**
2. Search for "Lock Live Preview"
3. Click "Install"

#### Git Clone
1. Under main menu select **Help > Show Extensions Folder**
2. Git clone this repository inside the folder user.

/*jshint browser: true, esnext: true, jquery: true */
/*global brackets, define*/

define(function (require, exports, module) {
	'use strict';
	
	// Modules
	var AppInit 		= brackets.getModule('utils/AppInit'),
		CommandManager 	= brackets.getModule('command/CommandManager'),
		Menus 			= brackets.getModule('command/Menus'),
		ExtensionUtils 	= brackets.getModule('utils/ExtensionUtils'),
		MainViewManager = brackets.getModule('view/MainViewManager'),
		DocumentManager = brackets.getModule('document/DocumentManager'),
		Inspector		= brackets.getModule('LiveDevelopment/Inspector/Inspector'),
		Commands		= brackets.getModule('command/Commands'),
		Strings 		= require('strings'),
		LLP_CMD_ID 		= 'bib.lockLivePreview',
		LLP_ICON_ID		= 'bib-lockLivePreview-icon',
		toolbarIcon 	= $('<a title="' + Strings.ICON_TITLE_BASE + '" id="' + LLP_ICON_ID + '" status="not-active"></a>');

	/**
	 * Original (Brackets) _onFileChanged function of LiveDevelopment.js
	 * @type {function}
	 */
	var _defaultFileChangeEvent;
	
	/**
	 * Current locked Live Preview file
	 * @type {string}
	 */
	var _currentLockedFile = '';
	
	/**
	 * Short file name of current locked Live Preview file
	 * @type {string}
	 */
	var _currentLockedNameShort = '';
	
	/**
	 * Live Preview is locked?
	 * @type {boolean}
	 */
	var _livePreviewIsLocked = false;
	
	/**
	 * Handler id of interval for updating icon status in main toolbar
	 * @type {integer}
	 */
	var _intervalId;
	
	/**
	 * Command object, to set checked/unchecked in menu
	 * @type {object}
	 */
	var _command;
	
	
	/**
	 * String.format function for strings with placeholders (e.g. '{0} missed the {1}'.format('John', 'bus'))
	 */
	String.prototype.format = function () {
		var args = arguments;
		return this.replace(/\{(\d+)\}/g, function (m, n) { return args[n]; });
	};
	
	/**
	 * @private
	 * Handle current file changed event: default Brackets behaviour or no change of document in case of lock
	 */
	function _onCurrentFileChanged () {
		// Update icon status
		_iconSetStatus();
		
		// Perform standard behaviour when no file is locked
		if (!_livePreviewIsLocked) {
			_defaultFileChangeEvent();
			return;
		}
		// Do nothing otherwise. Suppressing the default Brackets behaviour is the lock :-)
	}
	
	/**
	 * @private
	 * Set status and title of the icon in the main toolbar
	 */
	function _iconSetStatus () {
		var el 			= $('#' + LLP_ICON_ID),
			doc 		= DocumentManager.getCurrentDocument(),
			isConnected	= Inspector.connected(),
			status		= 'not-active',
			title		= '';
		
		// Determine icon status when Live Preview is activated
		if (isConnected && _livePreviewIsLocked) {
			status = (doc.file.fullPath === _currentLockedFile ? 'active-current' : 'active-not-current');
		}
		// Set icon status
		el.attr('status', status);
		
		// Set menu item to checked/unchecked
		_command.setChecked(status === 'active-current');
		
		// Set icon title, depending on context
		if (status === 'active-current') {
			title = Strings.ICON_TITLE_UNLOCK.format(doc.file.name);
		}
		if (status === 'active-not-current') {
			title = Strings.ICON_TITLE_SWITCH_LOCK.format(doc.file.name);
		}
		if (status === 'not-active') {
			title = Strings.ICON_TITLE_LOCK.format(doc.file.name);
		}
		el.prop('title', title);
	}
	
	/**
	 * @private
	 * Lock Live Preview icon clicked: action is context sensitive
	 * - Start Live Preview and lock file
	 * - End lock of file and return to default Live Preview behaviour
	 * - Switch lock to current file
	 */
	function _iconClick () {
		var doc = DocumentManager.getCurrentDocument();
		
		// Do nothing if there is no active document
		if (!doc) {
			return;
		}
		
		// Get context parameters: active file, existing Live Preview connection
		var file		= doc.file.fullPath,
			isConnected = Inspector.connected();
		
		// Decide what to do
		if (isConnected) {
			// Live Preview connection exists
			if (file === _currentLockedFile) {
				// Current file was locked, now toggle to unlocked Live Preview
				_currentLockedFile = '';
				_currentLockedNameShort = '';
				_livePreviewIsLocked = false;
			} else {
				// New file is locked
				_currentLockedFile = file;
				_currentLockedNameShort = doc.file.name;
				_livePreviewIsLocked = true;
				
				// Let Live Preview switch to new document
				_defaultFileChangeEvent();
			}
		} else {
			// No active Live Preview connection, so launch one
			_currentLockedFile = file;
			_currentLockedNameShort = doc.file.name;
			_livePreviewIsLocked = true;
			CommandManager.execute(Commands.FILE_LIVE_FILE_PREVIEW);
		}
		
		// Set new status of icon
		_iconSetStatus();
	}

	
	/**
	 * App Ready: init extension
	 */
	AppInit.appReady(function () {
		var events, i;
		
		// Load external stylesheet
		ExtensionUtils.loadStyleSheet(module, 'css/bib-lockLivePreview.css');

		// Add to File Menu, section Live Preview
		_command = CommandManager.register(Strings.COMMAND_NAME, LLP_CMD_ID, _iconClick);
		var fileMenu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
		fileMenu.addMenuItem(LLP_CMD_ID, 'Ctrl-Alt-Shift-P', Menus.FIRST_IN_SECTION, Menus.MenuSection.FILE_LIVE);
		

		// Add icon to Main Toolbar
		toolbarIcon.on('click', _iconClick).appendTo('#main-toolbar .buttons');
		
		// Disable _onFileChanged event in LiveDevelopment.js
		// Yes, it is hacky!
		events = MainViewManager._eventHandlers.currentFileChange;
		for (i = 0; i < events.length; i++) {
			if (events[i].handler.name === '_onFileChanged') {
				// _onFileChanged event found: store the function and remove it from the event list
				_defaultFileChangeEvent = MainViewManager._eventHandlers.currentFileChange.splice(i, 1);
				_defaultFileChangeEvent = _defaultFileChangeEvent[0].handler;
				break;
			}
		}
		
		// Add our own on change event
		MainViewManager.on('currentFileChange', _onCurrentFileChanged);
		
		// Set interval to update icon status in main toolbar
		_intervalId = setInterval(_iconSetStatus, 700);
	});
});

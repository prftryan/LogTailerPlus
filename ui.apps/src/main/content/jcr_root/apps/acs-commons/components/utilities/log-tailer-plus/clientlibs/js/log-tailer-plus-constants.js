/*
Most functionality, classes, data-attributes, etc are defined here.
Anything not included in the log-tailer-plus.html is generated dynamically using these values.

The following variable (values) are referenced in log-tailer-plus.html
and therefore should be modified with caution:
    * ADD_TAILER_CLASS
    * SELECTED_LOG_CLASS
*/

var LogTailerPlus = LogTailerPlus || {};
LogTailerPlus.Constants = {
/* Built-in Filters (see lowercase classes in css for details) */
    LOG_LEVELS: ['ERROR','WARN','INFO','DEBUG','TRACE'],

    /* Feature Toggles */
    //TODO: Make these toggle-able based on queryparam/cookie.
    ENABLE_RESIZE: true,


    /* Default Values */
    DEFAULT_REFRESH: 5,//seconds
    DEFAULT_LOGGER: '/logs/error.log',
    DEFAULT_GREP: "*",
    DEFAULT_SCROLL: 'follow',
    DEFAULT_STACK_CLOSED: false,


	/* LogTailerPlus Class Constants */
    HIDDEN_CLASS:	'hidden',
    PANEL_CONTAINER_CLASS: 'panel-container',
    LOG_PANEL_CLASS: "log-panel",
    LOG_TITLE_CLASS: 'log-title',
    LOG_RESULT_CLASS: 'log-result',
    ADVANCED_DIALOG_CLASS: 'advanced-properties-dialog',
    SELECTED_LOG_CLASS: 'selected-log',
    SCROLL_SWITCH_CLASS: 'scroll-switch',
    /* Dialog/Property Field Related */

	/* Button Classes */
    ADD_TAILER_CLASS: 'add-tailer',
    ADVANCED_LOG_CONFIG_CLASS: 'advanced-log-config',
    REMOVE_TAILER_CLASS: 'remove-tailer',

    /* Dialog/Property Field Classes */

    /* Log Scrolling Behavior */
    SCROLL_FOLLOW: 'follow',
    SCROLL_PIN: 'pin',

    ADV_LOG_CONFIG_FORM: 'advanced-log-config-form',
    CORAL_FORM_CLASS: "coral-Form coral-Form--aligned u-columnLarge",
	/* A Stack (in this context) is anything not matching filters.  It is collapsible by default. */
    STACK_CLASS: 'stack',
    STACK_CLOSED_CLASS: 'closed',
    STACK_ICON_CLASS: 'stack-icon',

    SPLITTER_CLASS: 'splitter',//also used in resizer.


    /* Data Attributes Constants */
    DATA_LOGGER: 'data-logger',
    DATA_REFRESH: 'data-refresh',
    DATA_GREP: 'data-grep',
    DATA_SCROLL: 'data-scroll',


	/* SlingLog Constants */
    LOGGER_SERVLET_PATH: '/system/console/slinglog/tailer.txt',
    LOGGER_GREP_PARAM: 'grep',
    LOGGER_TAIL_PARAM: 'tail',
    LOGGER_NAME_PARAM: 'name',

    /* JQuery Resize Constants*/
    RESIZER_HANDLE_SELECTOR: 'handleSelector',
    RESIZER_RESIZE_HEIGHT: 'resizeHeight'
}
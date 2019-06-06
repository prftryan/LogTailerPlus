# Log Tailer Plus
Log tailer plus is a javascript framework which polls the existing `/system/console/slinglog/tailer.txt` logger servlet endpoint to add formatting, tailing, and basic filtering functionality without the need of server side access.
## Requirements
* AEM 6.2+
* Log Tailer ui.apps Package
## Features
1. Tail any configured log without need of server side access
2. Built-in highlighting for common logging patterns
3. Grouping of stack traces and unmatched lines
4. Collapsible stack traces
5. Tail Multiple logs at once
6. Log panels are resizable (min width 600px per panel)
7. Pin/Follow on each log

## Upcoming Features

1. Ability to add custom filters/highlighting
2. Session storage - allow existing configurations to be remembered and re-opened.
3. Turn on and off the resizable functionality
4. Replace jquery-resizable and rewrite custom resizer logic
5. You tell me!

## How to Use
1. Install the latest release from [here](https://github.com/prftryan/LogTailerPlus/releases/)
2. There are three ways to launch the Log Tailer Plus:
    1. Browse to either the vanity path /log-tailer-plus ( localhost:4502/log-tailer-plus), 
    2. Directly through apps ( /apps/log-tailer-plus.html)
    3. An ACS-Commons tools navigational entry 

### Configurations
Every log panel has configurations for the tailing behavior.

---
#### Grep
**Purpose**: Grep, if you are familiar with the command line, is a tool to grab only relevant lines (based on a given regular expression).  It works similarly here, where only log lines matching the provided expression will be returned.  Examples: ERROR, \*10.12.2019\*, WARN, INFO, \* 

**Default**: * (Grab all lines)

For examples of how to use the grep property, see [here]( https://www.cyberciti.biz/faq/grep-regular-expressions/).
---
#### Refresh Rate (Seconds)
Refresh rate is the frequency in which we poll the log for updates.  By default, this is set at 5 seconds.  If you are seeing gaps in the log you may need to reduce this rate.

**Default**: 5 seconds
---
#### Lines Per Refresh
Lines per refresh is the number of lines we will retrieve each time we poll the log.  The larger values will ensure no log lines are missed, but will increase performance time.  By default we set this to 250 lines - but if you are seeing gaps in the log, increase this value or reduce the refresh rate above.

**Default**: 250 lines
---
#### Truncate After
This setting will tell your browser how much history to keep.  It defaults to 5000 *items* (not lines).  An item is each span group in the log result panel.  You can set this to go to essentially unlimited but may start seeing performance issues with extended sessions.

**Default**: 5000 items
---
#### Wrap Lines
This setting will adjust whether the logger will auto-wrap the longer lines to the next (true) or to use a horizontal scroll(false)

**Default**: Wrap Lines

---
#### Clear Log
The clear log is done through the log header.  It will delete all existing contents from the Log Tailer.

---
#### Pin/Follow Switch
In order to stop the log from automatically moving to the bottom upon adding new content, you can toggle the pin/follow switch in the loggers header in the right hand side.  When it is active(blue), the logger will continue to log, but your scrollbar will not be adjusted to the bottom.

**Default**: Follow

